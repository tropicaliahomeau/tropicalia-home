'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Pin Pad Component
const PinPad = ({ onCorrectPin }: { onCorrectPin: () => void }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const CORRECT_PIN = '0421';

    const handleInput = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === CORRECT_PIN) {
                    // Set cookie for middleware - 12 hours session
                    document.cookie = "kitchen_auth=true; path=/; max-age=43200";
                    onCorrectPin();
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 1000);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100] px-4">
            <div className="max-w-xs w-full bg-white rounded-[2.5rem] p-8 shadow-2xl text-center">
                <h2 className="text-2xl font-black text-gray-800 mb-2">Kitchen Access</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">Ingresa el PIN de Acceso</p>

                <div className="flex justify-center gap-4 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-[#4A5D23] border-[#4A5D23] scale-125' : 'border-gray-200'
                            } ${error ? 'bg-red-500 border-red-500 animate-shake' : ''}`}></div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((btn, i) => (
                        <button
                            key={i}
                            disabled={btn === ''}
                            onClick={() => btn === '⌫' ? setPin(pin.slice(0, -1)) : handleInput(btn)}
                            className={`h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90
                            ${btn === '' ? 'opacity-0' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                        >
                            {btn}
                        </button>
                    ))}
                </div>

                {error && <p className="text-red-500 font-bold text-xs mt-6 uppercase tracking-widest animate-pulse">PIN Incorrecto</p>}
            </div>
            <p className="mt-8 text-gray-500 text-xs font-bold uppercase tracking-widest">Tropicalia Latin Food Australia</p>
        </div>
    );
};

export default function KitchenDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Check for existing session cookie
        const hasSession = document.cookie.split('; ').find(row => row.startsWith('kitchen_auth=true'));
        if (hasSession) {
            setIsAuthenticated(true);
        }

        const loadOrders = async () => {
            try {
                // Fetch orders and their nested order_items
                const { data: ordersData, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .in('estado', ['pagado', 'preparando', 'entregado'])
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                    return;
                }

                if (ordersData) {
                    setOrders(ordersData);
                }
            } catch (e) {
                console.error("Error loading kitchen orders:", e);
            }
        };

        if (isAuthenticated) {
            loadOrders();
            const interval = setInterval(loadOrders, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const changeStatus = async (orderId: number, newStatus: string) => {
        try {
            await supabase.from('orders').update({ estado: newStatus }).eq('id', orderId);
            setOrders(orders.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
        } catch (e) {
            console.error('Failed to change status', e);
        }
    };

    // Sorting: Pending/Preparing first, Delivered last
    const sortedOrders = [...orders].sort((a, b) => {
        const aIsDone = a.estado === 'entregado';
        const bIsDone = b.estado === 'entregado';
        if (aIsDone === bIsDone) return 0;
        return aIsDone ? 1 : -1;
    });

    const filteredOrders = sortedOrders.filter(order =>
        (order.telefono || '').includes(searchTerm) ||
        (order.nombre_cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.id || '').toString().includes(searchTerm)
    );

    if (!isAuthenticated) {
        return <PinPad onCorrectPin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
            {/* Header List View */}
            {/* Operative Summary Section (Phase 3) */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
                <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Daily Totals */}
                        <div className="flex-1">
                            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">DAILY TOTALS (CURRENT CYCLE)</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {['LUN', 'MAR', 'MIE', 'JUE', 'VIE'].map((day, idx) => {
                                    const dayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
                                    const count = orders.filter(o => {
                                        const isDone = o.estado === 'entregado';
                                        if (isDone) return false;
                                        // Count order_items that are meals
                                        return o.order_items?.some((i: any) => i.tipo === 'meal' && i.nombre.toLowerCase().includes(dayNames[idx]));
                                    }).length;

                                    return (
                                        <div key={day} className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                                            <p className="text-[10px] font-bold text-gray-400 mb-1">{day}</p>
                                            <p className="text-xl font-black">{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Allergy Summary */}
                        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                            <h3 className="text-xs font-black uppercase text-red-400 tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                ALLERGY SUMMARY
                            </h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {orders.filter(o => o.order_items?.some((item: any) => item.notas && item.notas.trim() !== '')).length > 0 ? (
                                    orders.filter(o => o.order_items?.some((item: any) => item.notas && item.notas.trim() !== '')).map((o, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                                            <span className="font-bold text-red-200">{o.nombre_cliente}</span>
                                            <span className="font-black text-red-500 uppercase">
                                                {o.order_items.filter((i: any) => i.notas).map((i: any) => i.notas).join(', ')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 font-bold text-xs italic">No special requirements</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 mt-6">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            Kitchen <span className="text-[#4A5D23] animate-pulse">●</span>
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">OPERATIONAL ORDER LIST</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#4A5D23] transition-all font-medium text-sm"
                            placeholder="Search by Phone or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3.5 top-3.5 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-center bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PENDING</p>
                            <p className="text-2xl font-black text-orange-500">
                                {orders.filter(o => o.estado === 'pagado' || o.estado === 'preparando').length}
                            </p>
                        </div>
                        <div className="text-center bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Listos</p>
                            <p className="text-2xl font-black text-[#4A5D23]">
                                {orders.filter(o => o.estado === 'entregado').length}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
                {/* Compact List Headers - Desktop Only */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="col-span-1"># ORDER</div>
                    <div className="col-span-2">CUSTOMER</div>
                    <div className="col-span-2">PHONE</div>
                    <div className="col-span-2">ALLERGIES</div>
                    <div className="col-span-3">ORDER DETAIL</div>
                    <div className="col-span-2 text-right">Acción</div>
                </div>

                <div className="space-y-3">
                    {filteredOrders.map((order) => {
                        const isDone = order.estado === 'entregado';
                        const allergies = order.order_items?.filter((i: any) => i.notas).map((i: any) => i.notas).join(', ') || '';
                        const hasAllergies = allergies.length > 0;

                        return (
                            <div key={order.id} className={`bg-white rounded-[1.5rem] shadow-sm border transition-all ${isDone ? 'opacity-50 grayscale bg-gray-50 border-gray-200' : 'border-gray-100 hover:shadow-md'
                                }`}>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 md:p-5">
                                    {/* Order # */}
                                    <div className="lg:col-span-1 border-r border-gray-50 lg:pr-4">
                                        <div className="flex items-center justify-between lg:block">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase"># ORDER</span>
                                            <div className="font-black text-gray-800 text-lg">#{order.id}</div>
                                        </div>
                                    </div>

                                    {/* Customer */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center justify-between lg:block">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase">CUSTOMER</span>
                                            <div className="font-bold text-gray-900 truncate">{order.nombre_cliente}</div>
                                        </div>
                                    </div>

                                    {/* Phone Link */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center justify-between lg:block">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase">PHONE</span>
                                            <a href={`tel:${order.telefono}`} className="inline-flex items-center gap-1.5 text-[#4A5D23] font-black hover:text-[#3a491c] transition-colors bg-green-50/50 px-3 py-1.5 rounded-xl border border-green-100/50">
                                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" /></svg>
                                                {order.telefono || 'N/A'}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Allergies Highlight */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center justify-between lg:block">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase">ALLERGIES</span>
                                            <div className={`font-black text-[10px] uppercase px-3 py-1.5 rounded-xl inline-block border ${hasAllergies
                                                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse ring-4 ring-red-50'
                                                : 'bg-gray-50 text-gray-300 border-gray-100'
                                                }`}>
                                                {hasAllergies ? allergies : 'No Allergies'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Detail */}
                                    <div className="lg:col-span-3">
                                        <div className="flex items-center justify-between lg:block max-h-32 overflow-y-auto">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase">ORDER DETAIL</span>
                                            <div className="flex flex-col gap-1 w-full text-right lg:text-left">
                                                {order.order_items?.map((item: any) => (
                                                    <p key={item.id} className="text-xs font-bold text-gray-900 leading-tight">
                                                        <span className="text-[#4A5D23]">{item.cantidad}x</span> {item.nombre}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-2 flex flex-col gap-2 justify-end">
                                        {order.estado === 'pagado' && (
                                            <button
                                                onClick={() => changeStatus(order.id, 'preparando')}
                                                className="w-full lg:w-fit px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 bg-orange-500 text-white shadow-md hover:bg-orange-600"
                                            >
                                                Prepping
                                            </button>
                                        )}
                                        {(order.estado === 'pagado' || order.estado === 'preparando') && (
                                            <button
                                                onClick={() => changeStatus(order.id, 'entregado')}
                                                className="w-full lg:w-fit px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 bg-[#4A5D23] text-white shadow-md hover:bg-[#3a491c]"
                                            >
                                                Deliver
                                            </button>
                                        )}
                                        {order.estado === 'entregado' && (
                                            <button
                                                onClick={() => changeStatus(order.id, 'preparando')}
                                                className="w-full lg:w-fit px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 bg-gray-200 text-gray-600 hover:bg-gray-300"
                                            >
                                                Undo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <h3 className="text-lg font-black text-gray-800">No Orders</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">No hay actividad para mostrar en este momento</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
