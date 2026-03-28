'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setOrders(data);
                } else if (error) {
                    console.error("Supabase error:", error);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (statusFilter && order.estado !== statusFilter) return false;
        return true;
    });

    const changeStatus = async (orderId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'pagado' ? 'preparando' : currentStatus === 'preparando' ? 'entregado' : 'pagado';
        try {
            await supabase.from('orders').update({ estado: nextStatus }).eq('id', orderId);
            setOrders(orders.map(o => o.id === orderId ? { ...o, estado: nextStatus } : o));
        } catch (e) {
            console.error('Failed to change status', e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                    <p className="text-gray-500 text-sm">View and manage all customer orders</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pagado">Paid</option>
                        <option value="preparando">Preparing</option>
                        <option value="entregado">Delivered</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items & Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No orders found matching criteria.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-l-4 border-l-transparent hover:border-l-[#4A5D23]">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{order.nombre_cliente}</div>
                                            <div className="text-xs text-gray-500">{order.email_cliente}</div>
                                            <div className="text-xs font-mono text-[#4A5D23] mt-1">{order.telefono}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                                                {order.order_items?.map((item: any) => (
                                                    <div key={item.id} className="text-xs text-gray-800">
                                                        <span className="font-bold text-[#4A5D23]">{item.cantidad}x</span> {item.nombre}
                                                        {item.notas && <span className="text-red-500 ml-1 italic font-medium">({item.notas})</span>}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wider">
                                                Paid via {order.metodo_pago}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => changeStatus(order.id, order.estado)}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer hover:shadow-md transition-all
                                                ${order.estado === 'entregado' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                                    order.estado === 'preparando' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                                        'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                                            >
                                                {order.estado.toUpperCase()}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-black">
                                            ${order.total}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
