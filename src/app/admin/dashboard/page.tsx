'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

export default function DashboardPage() {
    const [activeTab, setActiveTab] = React.useState<'hoy' | 'macro'>('hoy');
    const [selectedProof, setSelectedProof] = React.useState<string | null>(null);
    const [showExpensesModal, setShowExpensesModal] = React.useState(false);
    const [tempExpenses, setTempExpenses] = React.useState<{ reason: string, amount: string }[]>(
        Array(5).fill({ reason: '', amount: '' })
    );
    const [detailModal, setDetailModal] = React.useState<{ show: boolean, type: 'ingresos' | 'gastos', data: any[] }>({
        show: false,
        type: 'ingresos',
        data: []
    });
    const [realKpis, setRealKpis] = React.useState({
        totalOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        activeCustomers: 0,
        recurrentCustomers: 0,
        allergicCustomers: 0,
        totalRevenue: 0,
        lunchRevenue: 0,
        extrasRevenue: 0,
        totalExpenses: 0,
        retentionRate: 0
    });
    const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
    const [financialComparison, setFinancialComparison] = React.useState<any[]>([]);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const usersJson = localStorage.getItem("tropicalia_all_users") || "[]";
                const users = JSON.parse(usersJson);
                
                // Fetch orders from Supabase
                const { data: dbOrders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
                const orders = dbOrders || [];

                const expensesJson = localStorage.getItem("tropicalia_expenses") || "[]";
                const expenses = JSON.parse(expensesJson);

                const customers = users.filter((u: any) => u.role === 'CUSTOMER');
                const allergicList = customers.filter((u: any) => u.allergies && u.allergies !== "Ninguna" && u.allergies !== "N/A");

                const revenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
                const lunchRev = orders.reduce((sum: number, o: any) => sum + (Number(o.lunchTotal || o.total) || 0), 0);
                const extraRev = orders.reduce((sum: number, o: any) => sum + (Number(o.extrasTotal) || 0), 0);
                const totalExp = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

            const delivered = orders.filter((o: any) => o.estado === 'entregado' || o.estado === 'Delivered').length;
            const pending = orders.filter((o: any) => ['pendiente', 'Pending', 'preparando', 'Preparing', 'Ready'].includes(o.estado)).length;

            setRealKpis({
                totalOrders: orders.length,
                deliveredOrders: delivered,
                pendingOrders: pending,
                activeCustomers: customers.length,
                recurrentCustomers: customers.filter((u: any) => u.subscription).length,
                allergicCustomers: allergicList.length,
                totalRevenue: revenue,
                lunchRevenue: lunchRev,
                extrasRevenue: extraRev,
                totalExpenses: totalExp,
                retentionRate: customers.length > 0 ? Math.round((customers.filter((u: any) => u.subscription).length / customers.length) * 100) : 0
            });

            setFinancialComparison([
                { name: 'Ingresos', valor: revenue, fill: '#4A5D23' },
                { name: 'Gastos', valor: totalExp || (revenue * 0.35), fill: '#ef4444' }
            ]);

            setRecentOrders(orders.slice(-10).reverse());
            setRecentOrders(orders.slice(-10).reverse());
        } catch (e) {
            console.error("Dashboard Sync Error:", e);
        }
    };
    loadDashboardData();
    }, [activeTab]);

    const downloadInactiveReport = () => {
        try {
            const users = JSON.parse(localStorage.getItem("tropicalia_all_users") || "[]");
            const orders = JSON.parse(localStorage.getItem("tropicalia_orders") || "[]");
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activeUserIds = new Set(orders
                .filter((o: any) => new Date(o.date) >= sevenDaysAgo)
                .map((o: any) => o.customerId || o.customerName));

            const inactive = users.filter((u: any) => u.role === 'CUSTOMER' && !activeUserIds.has(u.id) && !activeUserIds.has(u.name));

            const csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone,Allergies\n"
                + inactive.map((u: any) => `${u.name},${u.email},${u.phone || 'N/A'},${u.allergies || 'Ninguna'}`).join("\n");

            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `inactivos_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) { alert("Error al generar reporte"); }
    };

    const addExpenseRow = () => {
        setTempExpenses([...tempExpenses, { reason: '', amount: '' }]);
    };

    const handleExpenseChange = (index: number, field: 'reason' | 'amount', value: string) => {
        const updated = [...tempExpenses];
        updated[index] = { ...updated[index], [field]: value };
        setTempExpenses(updated);
    };

    const saveExpenses = () => {
        const validExpenses = tempExpenses.filter(e => e.reason && e.amount);
        const saved = JSON.parse(localStorage.getItem('tropicalia_expenses') || '[]');
        localStorage.setItem('tropicalia_expenses', JSON.stringify([...saved, ...validExpenses.map(e => ({ ...e, amount: parseFloat(e.amount), date: new Date().toISOString() }))]));
        setShowExpensesModal(false);
        window.location.reload();
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in px-2 md:px-0">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reporte Ejecutivo</h1>
                    <p className="text-gray-500 font-medium">Gestiona tu operación y estrategia</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={downloadInactiveReport}
                        className="flex-1 md:flex-none px-4 py-2 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm"
                    >
                        Reporte Inactividad
                    </button>
                    <button
                        onClick={() => setShowExpensesModal(true)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all text-sm flex items-center gap-2 justify-center"
                    >
                        <span>Registrar Gastos</span>
                    </button>
                    <button className="flex-1 md:flex-none px-4 py-2 bg-[#4A5D23] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-green-900/20 transition-all text-sm">
                        Exportar Todo
                    </button>
                </div>
            </header>

            {/* TAB SELECTOR - Mobile Friendly */}
            <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('hoy')}
                    className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'hoy' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-gray-400'}`}
                >
                    Sincronía (Hoy)
                </button>
                <button
                    onClick={() => setActiveTab('macro')}
                    className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'macro' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-gray-400'}`}
                >
                    Estratégico (Macro)
                </button>
            </div>

            {activeTab === 'hoy' ? (
                <div className="space-y-6">
                    {/* Real-time Operacional Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36 border-b-4 border-b-[#4A5D23]">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pedidos Hoy</span>
                            <div className="text-4xl font-black text-[#4A5D23]">{realKpis.totalOrders}</div>
                            <div className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full w-fit font-bold">ACTIVO</div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36 border-b-4 border-b-orange-400">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pending</span>
                            <div className="text-4xl font-black text-orange-500">{realKpis.pendingOrders}</div>
                            <div className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full w-fit font-bold">KITCHEN</div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36 border-b-4 border-b-red-400">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Allergies</span>
                            <div className="text-4xl font-black text-red-500">{realKpis.allergicCustomers}</div>
                            <div className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full w-fit font-bold">CRÍTICO</div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36 border-b-4 border-b-gray-800">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recaudado</span>
                            <div className="text-3xl font-black text-gray-800">${realKpis.totalRevenue.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-400 font-bold">TOTAL CICLO</div>
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-800">Flujo de Clientes</h2>
                            <span className="text-gray-400 text-xs font-bold animate-pulse">● Sincronizado</span>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-1.5 h-10 rounded-full ${order.estado === 'entregado' || order.estado === 'Delivered' ? 'bg-green-400' : (order.estado === 'Pending Validation' ? 'bg-blue-400' : 'bg-orange-400')}`}></div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{order.nombre_cliente || order.customer}</p>
                                            <p className="text-[10px] font-bold text-[#4A5D23]">{order.telefono || order.phone || 'Sin teléfono'}</p>
                                            <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">#{order.order_number || order.id} • {order.meal || 'Resumen de Orden'}</p>
                                        </div>
                                    </div>

                                    {/* Support / Verification Column */}
                                    <div className="flex-[1.2] flex items-center gap-2">
                                        {order.payIdProof && (
                                            <button
                                                onClick={() => setSelectedProof(order.payIdProof as string)}
                                                className="bg-blue-50 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm border border-blue-100 shrink-0"
                                                title="Ver Comprobante"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </button>
                                        )}
                                        {order.estado === 'Pending Validation' && (
                                            <button
                                                onClick={() => {
                                                    const updatedOrders = recentOrders.map(o => o.id === order.id ? { ...o, estado: 'Confirmed' } : o);
                                                    localStorage.setItem('tropicalia_orders', JSON.stringify(updatedOrders));
                                                    window.location.reload();
                                                }}
                                                className="bg-[#4A5D23] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-[#3a491c] transition-all shadow-md shadow-[#4A5D23]/20"
                                            >
                                                Validar Pago
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="font-black text-gray-900">${order.total}</p>
                                        <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full 
                                            ${order.estado === 'entregado' || order.estado === 'Delivered' ? 'bg-green-100 text-green-600' :
                                                order.estado === 'pendiente' || order.estado === 'Pending Validation' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.estado === 'pagado' ? 'Pagado' : (order.estado || 'Pendiente')}
                                        </p>
                                        {order.payIdProof && (
                                            <button
                                                onClick={() => setSelectedProof(order.payIdProof as string)}
                                                className="text-[9px] font-bold text-blue-600 hover:text-blue-800 hover:underline uppercase transition-colors"
                                            >
                                                Ver Comprobante
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {recentOrders.length === 0 && <div className="text-center py-12 text-gray-400 italic">No hay actividad reciente aún.</div>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Macro Strategic Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-900 p-6 rounded-[2rem] text-white">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase">Ingreso Bruto</p>
                                <button
                                    onClick={() => {
                                        const orders = JSON.parse(localStorage.getItem("tropicalia_orders") || "[]");
                                        setDetailModal({ show: true, type: 'ingresos', data: orders });
                                    }}
                                    className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg font-bold transition-all"
                                >
                                    Ver Detalle
                                </button>
                            </div>
                            <div className="text-3xl font-black">${realKpis.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Gastos (Est.)</p>
                                <button
                                    onClick={() => {
                                        const expenses = JSON.parse(localStorage.getItem("tropicalia_expenses") || "[]");
                                        setDetailModal({ show: true, type: 'gastos', data: expenses });
                                    }}
                                    className="text-[9px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg font-bold text-gray-600 transition-all"
                                >
                                    Ver Detalle
                                </button>
                            </div>
                            <div className="text-3xl font-black text-red-500">${realKpis.totalExpenses.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Utilidad</p>
                            <div className="text-3xl font-black text-green-600">${(realKpis.totalRevenue - realKpis.totalExpenses).toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Retención</p>
                            <div className="text-3xl font-black text-[#4A5D23]">{realKpis.retentionRate}%</div>
                        </div>
                    </div>

                    {/* Macro Charts & Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between h-[400px]">
                            <h3 className="font-black text-gray-800 mb-6 uppercase text-sm tracking-widest">Fuentes de Ingreso</h3>
                            <div className="space-y-8 flex-1 flex flex-col justify-center">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-black text-gray-800">
                                        <span>Almuerzos</span>
                                        <span>${realKpis.lunchRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4A5D23] rounded-full" style={{ width: `${Math.round((realKpis.lunchRevenue / (realKpis.totalRevenue || 1)) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-black text-gray-800">
                                        <span>Bebidas y Extras</span>
                                        <span>${realKpis.extrasRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round((realKpis.extrasRevenue / (realKpis.totalRevenue || 1)) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase">Calculado basado en pedidos de este ciclo</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 h-[400px] flex flex-col">
                            <h3 className="font-black text-gray-800 mb-6 uppercase text-sm tracking-widest">Balance Ingreso vs Gasto</h3>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financialComparison} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 800, fill: '#1f2937' }} width={80} />
                                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="valor" radius={[0, 10, 10, 0]} barSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Modal */}
            {detailModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-scale-up">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2.5rem]">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 capitalize">Detalle de {detailModal.type}</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Registros Históricos</p>
                            </div>
                            <button
                                onClick={() => setDetailModal({ ...detailModal, show: false })}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-all font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-8">
                            <div className="space-y-3">
                                {detailModal.data.length > 0 ? (
                                    detailModal.data.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                            <div>
                                                <p className="font-bold text-gray-900">{detailModal.type === 'ingresos' ? item.customer : item.reason}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">{new Date(item.date).toLocaleDateString()} • {detailModal.type === 'ingresos' ? item.meal : 'Gasto Semanal'}</p>
                                            </div>
                                            <div className={`font-black ${detailModal.type === 'ingresos' ? 'text-green-600' : 'text-red-500'}`}>
                                                {detailModal.type === 'ingresos' ? '+' : '-'}${parseFloat(item.total || item.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-gray-400 italic">No hay registros aún.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/50 rounded-b-[2.5rem] border-t border-gray-100 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total en esta vista: ${detailModal.data.reduce((sum, i) => sum + parseFloat(i.total || i.amount || 0), 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Expenses Modal */}
            {showExpensesModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-scale-up p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Registrar Gastos de la Semana</h3>
                            <p className="text-gray-500 font-medium">Define los costos para calcular tu margen neto</p>
                        </div>

                        <div className="space-y-3 max-h-[50vh] overflow-auto mb-6 pr-2">
                            {tempExpenses.map((exp, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Motivo..."
                                        value={exp.reason}
                                        onChange={(e) => handleExpenseChange(idx, 'reason', e.target.value)}
                                        className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#4A5D23] transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="$"
                                        value={exp.amount}
                                        onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                                        className="w-24 bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-red-600 focus:ring-2 focus:ring-[#4A5D23] transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addExpenseRow}
                            className="w-full py-3 mb-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm"
                        >
                            (+) Agregar más gastos
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowExpensesModal(false)}
                                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveExpenses}
                                className="flex-1 py-4 bg-[#4A5D23] text-white rounded-2xl font-black shadow-xl shadow-green-900/20 hover:bg-[#3a491c] transition-all"
                            >
                                Guardar Gastos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Modal Overlay */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedProof(null)}
                >
                    <div className="relative max-w-2xl w-full bg-white rounded-3xl p-2 shadow-2xl overflow-hidden animate-scale-up">
                        <button
                            className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center font-black hover:bg-black transition-all z-10"
                            onClick={() => setSelectedProof(null)}
                        >
                            ✕
                        </button>
                        <div className="overflow-auto max-h-[80vh] rounded-2xl">
                            <img
                                src={selectedProof}
                                alt="Comprobante de Pago"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Comprobante PayID</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}