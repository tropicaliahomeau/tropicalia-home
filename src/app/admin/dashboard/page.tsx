'use client';

import React from 'react';
import dynamic from 'next/dynamic';

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
        try {
            const usersJson = localStorage.getItem("tropicalia_all_users") || "[]";
            const users = JSON.parse(usersJson);
            const ordersJson = localStorage.getItem("tropicalia_orders") || "[]";
            const orders = JSON.parse(ordersJson);
            const expensesJson = localStorage.getItem("tropicalia_expenses") || "[]";
            const expenses = JSON.parse(expensesJson);

            const customers = users.filter((u: any) => u.role === 'CUSTOMER');
            const allergicList = customers.filter((u: any) => u.allergies && u.allergies !== "Ninguna" && u.allergies !== "N/A");

            const revenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
            const lunchRev = orders.reduce((sum: number, o: any) => sum + (o.lunchTotal || 0), 0);
            const extraRev = orders.reduce((sum: number, o: any) => sum + (o.extrasTotal || 0), 0);
            const totalExp = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

            const delivered = orders.filter((o: any) => o.status === 'entregado' || o.status === 'Delivered').length;
            const pending = orders.filter((o: any) => ['pendiente', 'Pending', 'preparando', 'Preparing', 'Ready'].includes(o.status)).length;

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
        } catch (e) {
            console.error("Dashboard Sync Error:", e);
        }
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

            const csvContent = "data:text/csv;charset=utf-8,Nombre,Email,Telefono,Alergias\n"
                + inactive.map((u: any) => `${u.name},${u.email},${u.phone || 'N/A'},${u.allergies || 'Ninguna'}`).join("\n");

            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `inactivos_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) { alert("Error al generar reporte"); }
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
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pendientes</span>
                            <div className="text-4xl font-black text-orange-500">{realKpis.pendingOrders}</div>
                            <div className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full w-fit font-bold">COCINA</div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36 border-b-4 border-b-red-400">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Alergias</span>
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
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-10 rounded-full ${order.status === 'entregado' || order.status === 'Delivered' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{order.customer}</p>
                                            <p className="text-[10px] font-bold text-[#4A5D23]">{order.phone || 'Sin teléfono'}</p>
                                            <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">#{order.id} • {order.meal}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="font-black text-gray-900">${order.total}</p>
                                        <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${order.status === 'entregado' || order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.status}
                                        </p>
                                        {order.payIdProof && (
                                            <button
                                                onClick={() => alert(`Comprobante adjunto: ${order.payIdProof}`)}
                                                className="text-[9px] font-bold text-blue-600 hover:underline uppercase"
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
                            <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Ingreso Bruto</p>
                            <div className="text-3xl font-black">${realKpis.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Gastos (Est.)</p>
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
        </div>
    );
}