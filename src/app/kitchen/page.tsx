'use client';

import React, { useState } from 'react';
import { Order } from '@/types';

// Mock Data for demonstration with Phones
const INITIAL_ORDERS: (Order & { phone: string })[] = [
    {
        id: 101,
        user_id: 1,
        customer_name: "Juan Perez",
        phone: "+57 300 123 4567",
        status: 'preparing',
        total_amount: 85,
        items: [
            { id: 1, day: 'Lunes', name: 'Bandeja Paisa', description: 'Traditional platter' },
            { id: 2, day: 'Miércoles', name: 'Ajiaco', description: 'Potato soup' }
        ],
        delivery_method: 'delivery',
        payment_method: 'auto',
        created_at: new Date().toISOString(),
        extras: [],
        notes: "ALERGIA: Manipular con cuidado, alergia severa al MANÍ (Peanuts)."
    },
    {
        id: 102,
        user_id: 2,
        customer_name: "Maria Rodriguez",
        phone: "+57 310 987 6543",
        status: 'pending',
        total_amount: 72,
        items: [
            { id: 3, day: 'Martes', name: 'Sancocho', description: 'Hearty soup' }
        ],
        delivery_method: 'pickup',
        payment_method: 'payid',
        created_at: new Date().toISOString(),
        extras: [{ name: 'Pony Malta', quantity: 2 }],
        notes: ""
    },
    {
        id: 103,
        user_id: 3,
        customer_name: "Carlos Gomez",
        phone: "+57 315 555 1122",
        status: 'preparing',
        total_amount: 85,
        items: [
            { id: 1, day: 'Lunes', name: 'Bandeja Paisa', description: 'Traditional platter' },
            { id: 4, day: 'Jueves', name: 'Mondongo', description: 'Tripe soup' }
        ],
        delivery_method: 'delivery',
        payment_method: 'auto',
        created_at: new Date().toISOString(),
        extras: [],
        notes: "Sin cilantro por favor."
    }
];

export default function KitchenDashboard() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate Daily Counts
    const dailyCounts = {
        Lunes: 0,
        Martes: 0,
        Miércoles: 0,
        Jueves: 0,
        Viernes: 0
    };

    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.day in dailyCounts) {
                // @ts-ignore
                dailyCounts[item.day]++;
            }
        });
    });

    const toggleStatus = (orderId: number) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const newStatus = order.status === 'delivered' ? 'preparing' : 'delivered';
                return { ...order, status: newStatus };
            }
            return order;
        }));
    };

    // Filter Logic
    const filteredOrders = orders.filter(order =>
        order.phone.includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            {/* Header & Daily Summary */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Cocina 👨‍🍳</h1>
                        <p className="text-gray-500">Gestión de Preparación y Entregas</p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-96 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#4A5D23] focus:border-[#4A5D23] sm:text-sm transition-shadow"
                            placeholder="Buscar por teléfono o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-[#4A5D23] text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 whitespace-nowrap">
                        {filteredOrders.length} / {orders.length}
                    </div>
                </div>

                {/* Daily Counts Bar */}
                <div className="grid grid-cols-5 gap-4">
                    {Object.entries(dailyCounts).map(([day, count]) => (
                        <div key={day} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{day}</span>
                            <span className="text-3xl font-bold text-[#4A5D23]">{count}</span>
                            <span className="text-xs text-gray-400">platos</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg">No se encontraron pedidos para "{searchTerm}"</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 flex flex-col relative overflow-hidden
                        ${order.status === 'delivered' ? 'opacity-60 grayscale-[0.5] border-gray-200' : 'border-gray-100 hover:shadow-lg hover:-translate-y-1'}
                    `}>
                            {/* Status Strip */}
                            <div className={`h-2 w-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>

                            {/* Order Header */}
                            <div className="p-5 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-xl text-gray-800">#{order.id}</span>
                                        {order.delivery_method === 'delivery' ? (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Domicilio</span>
                                        ) : (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Recogida</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{order.customer_name}</h3>
                                    {/* Contact Info */}
                                    <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-gray-500 text-sm mt-1 hover:text-[#4A5D23] transition-colors w-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {order.phone}
                                    </a>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                                </span>
                            </div>

                            {/* ALERTA DE ALERGIAS */}
                            {order.notes && (order.notes.toLowerCase().includes('alergia') || order.notes.toLowerCase().includes('allergy')) && (
                                <div className="mx-5 mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <h4 className="font-extrabold text-red-700 uppercase text-xs tracking-wider">¡ALERTA DE ALERGIA!</h4>
                                    </div>
                                    <p className="text-red-900 font-bold text-sm leading-snug">
                                        {order.notes}
                                    </p>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="px-5 pb-4 flex-1">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Platos</h4>
                                <ul className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <li key={`${order.id}-item-${idx}`} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">{item.day}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                <button
                                    onClick={() => toggleStatus(order.id)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2
                                    ${order.status === 'delivered'
                                            ? 'bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-100'
                                            : 'bg-[#4A5D23] text-white hover:bg-[#3a491c] shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {order.status === 'delivered' ? (
                                        <>
                                            <span>Revertir a Pendiente</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Marcar Entregado</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
