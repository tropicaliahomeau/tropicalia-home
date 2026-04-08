'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MENUS } from '@/data/menus';



export default function KitchenDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [weekMap, setWeekMap] = useState<Record<string, string>>({});
    const [menuMap, setMenuMap] = useState<Record<string, string>>({});
    const [isSundayReset, setIsSundayReset] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                // Determine if we should show zero totals due to Sunday reset
                const now = new Date();
                const sydneyTimeStr = now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' });
                const sydneyTime = new Date(sydneyTimeStr);
                const isReset = sydneyTime.getDay() === 0 && sydneyTime.getHours() >= 21;
                setIsSundayReset(isReset);

                // Fetch active week map
                const { data: activeWeekArr } = await supabase
                    .from('weekly_menus')
                    .select('id')
                    .eq('is_enabled', true)
                    .limit(1);
                
                if (activeWeekArr && activeWeekArr.length > 0) {
                    const activeWeekId = activeWeekArr[0].id;
                    const { data: weekItems } = await supabase
                        .from('weekly_menu_items')
                        .select('menu_item_id, dia, menu_items(id, nombre)')
                        .eq('weekly_menu_id', activeWeekId);
                        
                    if (weekItems) {
                        const map: Record<string, string> = {};
                        weekItems.forEach((wi: any) => {
                            const item = Array.isArray(wi.menu_items) ? wi.menu_items[0] : wi.menu_items;
                            map[String(wi.menu_item_id)] = wi.dia;
                            if (item && item.nombre) {
                                map[item.nombre] = wi.dia;
                            }
                        });
                        setWeekMap(map);
                    }
                }

                // Fetch all menu items mapping
                const { data: allMenuItems } = await supabase.from('menu_items').select('id, nombre, precio');
                const tempMenuMap: Record<string, string> = {};
                if (allMenuItems) {
                    allMenuItems.forEach((item: any) => { tempMenuMap[item.id] = item.nombre; });
                }
                MENUS.forEach(w => w.meals.forEach(m => { tempMenuMap[m.id as string] = m.title; }));
                const hardcodedExtras = [
                    { id: '1', name: 'Pony Malta' },
                    { id: '2', name: 'Colombiana' },
                    { id: '3', name: 'Manzana Postobón' },
                    { id: '4', name: 'Bom bom bum' },
                    { id: '5', name: 'Mini Chocorramo' },
                ];
                hardcodedExtras.forEach(e => { tempMenuMap[e.id] = e.name; });
                setMenuMap(tempMenuMap);

                // Fetch orders and their nested order_items
                const { data: ordersData, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .order('created_at', { ascending: false });

                console.log('Orders query result:', ordersData);
                console.log('Orders query error:', error);

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

        const interval = setInterval(loadOrders, 30000);
        loadOrders();
        return () => clearInterval(interval);
    }, []);

    const changeStatus = async (orderId: number) => {
        try {
            // Remove instantly
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: 'picked_up' } : o));
            
            // Update Supabase in background
            await supabase.from('orders').update({ estado: 'picked_up' }).eq('id', orderId);
        } catch (e) {
            console.error('Failed to change status', e);
            // Revert on error
            setOrders(orders.map(o => o.id === orderId ? { ...o, estado: 'preparando' } : o));
        }
    };

    const filteredOrders = orders.filter(order =>
        (order.estado === 'preparando' || order.estado === 'picked_up') && (
            (order.telefono || '').includes(searchTerm) ||
            (order.nombre_cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.id || '').toString().includes(searchTerm)
        )
    );



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
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                                    const EnToSp: Record<string, string> = {
                                        'monday': 'lunes', 'tuesday': 'martes', 'wednesday': 'miercoles',
                                        'thursday': 'jueves', 'friday': 'viernes'
                                    };
                                    const spanishDay = EnToSp[day];
                                    
                                    const count = isSundayReset ? 0 : orders.reduce((sum, o) => {
                                        if (o.estado !== 'preparando') return sum;
                                        return sum + (o.order_items || []).reduce((itemSum: number, i: any) => {
                                            const itemName = menuMap[String(i.menu_item_id)];
                                            const itemDay = weekMap[String(i.menu_item_id)] || (itemName && weekMap[itemName]) || weekMap[i.nombre] || weekMap[i.menu_items?.nombre];
                                            if (!itemDay) return itemSum;
                                            
                                            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                                            const normItemDay = normalize(itemDay);
                                            const normSpanishDay = normalize(spanishDay);
                                            const normDay = normalize(day);

                                            if (normItemDay === normSpanishDay || normItemDay === normDay) {
                                                return itemSum + (i.cantidad || 1);
                                            }
                                            return itemSum;
                                        }, 0);
                                    }, 0);

                                    return (
                                        <div key={day} className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                                            <p className="text-[10px] font-bold text-gray-400 mb-1">{day.substring(0,3).toUpperCase()}</p>
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
                        const allergies = order.order_items?.filter((i: any) => i.notas).map((i: any) => i.notas).join(', ') || '';
                        const hasAllergies = allergies.length > 0;

                        return (
                            <div key={order.id} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 md:p-5">
                                    {/* Order # */}
                                    <div className="lg:col-span-1 border-r border-gray-50 lg:pr-4">
                                        <div className="flex items-center justify-between lg:block">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase"># ORDER</span>
                                            <div className="font-black text-gray-800 text-lg">#{order.order_number || order.id}</div>
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
                                        <div className="flex items-center justify-between lg:block max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            <span className="lg:hidden text-[10px] font-black text-gray-400 uppercase">ORDER DETAIL</span>
                                            <div className="flex flex-col gap-3 w-full text-right lg:text-left">
                                                {(() => {
                                                    const allItems: any[] = [];
                                                    (order.order_items || []).forEach((item: any) => {
                                                        const itemName = menuMap[item.menu_item_id] || item.menu_item_id || 'Item Desconocido';
                                                        allItems.push({ name: itemName, qty: item.cantidad || 1 });
                                                    });

                                                    return (
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">🛒 Items</p>
                                                            {allItems.map((i, idx) => (
                                                                <p key={'i'+idx} className="text-xs font-bold text-gray-900 leading-tight">
                                                                    <span className="text-[#4A5D23] font-black">{i.qty}x</span> {i.name}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-2 flex flex-col items-center lg:items-end justify-center gap-2">
                                        <button
                                            onClick={() => order.estado === 'preparando' && changeStatus(order.id)}
                                            disabled={order.estado === 'picked_up'}
                                            className={order.estado === 'picked_up'
                                                ? 'bg-green-500 text-white px-4 py-3 rounded-2xl font-black text-xs uppercase cursor-not-allowed opacity-75'
                                                : 'bg-yellow-500 text-white px-4 py-3 rounded-2xl font-black text-xs uppercase hover:bg-yellow-600 cursor-pointer'
                                            }
                                        >
                                            {order.estado === 'picked_up' ? 'Picked Up ✓' : 'Preparing'}
                                        </button>
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
