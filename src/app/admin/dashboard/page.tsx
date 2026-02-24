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

// Mock Data
const kpiData = {
    totalOrders: 203,
    activeCustomers: 168,
    recurrentCustomers: 145, // New Metric
    allergicCustomers: 12,   // New Metric
    totalRevenue: 6150,
    retentionRate: 99
};

const weeklyData = [
    { name: 'Semana 1', usuarios: 120, pedidos: 150 },
    { name: 'Semana 2', usuarios: 135, pedidos: 180 },
    { name: 'Semana 3', usuarios: 150, pedidos: 190 },
    { name: 'Semana 4', usuarios: 168, pedidos: 203 },
];

const monthlyData = [
    { name: 'Sep', ventas: 4000 },
    { name: 'Oct', ventas: 4500 },
    { name: 'Nov', ventas: 3800 },
    { name: 'Dic', ventas: 6000 },
    { name: 'Ene', ventas: 5200 },
    { name: 'Feb', ventas: 6150 },
];

const recentOrders = [
    { id: '1001', customer: 'Ana María', status: 'entregado', total: 85, date: '2026-02-16' },
    { id: '1002', customer: 'Jorge Luis', status: 'pendiente', total: 72, date: '2026-02-16' },
    { id: '1003', customer: 'Luisa Fernanda', status: 'preparando', total: 85, date: '2026-02-16' },
    { id: '1004', customer: 'Carlos A.', status: 'entregado', total: 85, date: '2026-02-15' },
    { id: '1005', customer: 'Maria P.', status: 'cancelado', total: 0, date: '2026-02-15' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Reporte Ejecutivo</h2>
                    <p className="text-gray-500 mt-1">Resumen de actividad - Ciclo Actual</p>
                </div>
                <button className="bg-[#4A5D23] text-white px-4 py-2 rounded-lg hover:bg-[#3a491c] transition-colors shadow-lg shadow-green-900/20">
                    Descargar Reporte PDF
                </button>
            </header>

            {/* Tarjetas de Resumen (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Clientes Recurrentes</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-4xl font-bold text-[#4A5D23]">{kpiData.recurrentCustomers}</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full mb-1">
                            86% del total
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-4 border-l-red-400">
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Clientes Alérgicos</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-4xl font-bold text-gray-800">{kpiData.allergicCustomers}</h4>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full mb-1">
                            Requieren Atención
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Ingreso Total</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-4xl font-bold text-gray-800">${kpiData.totalRevenue.toLocaleString()}</h4>
                        <span className="text-sm text-gray-400 mb-1">Este Mes</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Retención</p>
                    <div className="flex items-end justify-between mt-2">
                        <h4 className="text-4xl font-bold text-gray-800">{kpiData.retentionRate}%</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full mb-1">Top 1%</span>
                    </div>
                </div>
            </div>

            {/* Gráficos Comparativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comparativo Últimas 4 Semanas */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Crecimiento - Últimas 4 Semanas</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f9f9f9' }}
                                />
                                <Bar dataKey="usuarios" name="Usuarios Activos" fill="#4A5D23" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="pedidos" name="Pedidos" fill="#D4A373" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Comparativo Últimos 6 Meses */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Tendencia de Ventas - 6 Meses</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4A5D23" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4A5D23" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    formatter={(value) => [`$${value}`, 'Ventas']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="ventas" stroke="#4A5D23" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pedidos Recientes */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-xl">Pedidos Recientes</h3>
                    <button className="text-[#4A5D23] font-bold text-sm hover:underline">Ver Todos</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 font-semibold text-gray-400 text-sm pl-4">ID</th>
                                <th className="pb-4 font-semibold text-gray-400 text-sm">Cliente</th>
                                <th className="pb-4 font-semibold text-gray-400 text-sm">Fecha</th>
                                <th className="pb-4 font-semibold text-gray-400 text-sm">Total</th>
                                <th className="pb-4 font-semibold text-gray-400 text-sm">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-mono text-sm text-gray-500 pl-4">#{order.id}</td>
                                    <td className="py-4 font-medium text-gray-800">{order.customer}</td>
                                    <td className="py-4 text-gray-500 text-sm">{order.date}</td>
                                    <td className="py-4 font-bold text-gray-800">${order.total}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'entregado' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}