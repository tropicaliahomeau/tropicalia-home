'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showExpensesModal, setShowExpensesModal] = useState(false);
    const [tempExpenses, setTempExpenses] = useState<{ reason: string, amount: string }[]>(
        Array(5).fill({ reason: '', amount: '' })
    );

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
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 fixed h-full bg-white border-r border-gray-200 p-6 z-[60]">
                <div className="mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#4A5D23] rounded-full flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <h1 className="font-bold text-[#4A5D23] text-xl">Tropicalia HOME</h1>
                </div>

                <nav className="space-y-2">
                    <Link href="/admin/dashboard" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/menu" className={`block px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin/menu' ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'text-gray-700 hover:bg-gray-50'}`}>
                        🍽️ Gestión Menú
                    </Link>
                    <button
                        onClick={() => setShowExpensesModal(true)}
                        className="w-full text-left flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-[#4A5D23]/10 hover:text-[#4A5D23] font-medium transition-colors"
                    >
                        💸 Gestión de Gastos
                    </button>
                    <Link href="/admin/orders" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#4A5D23]/10 hover:text-[#4A5D23] font-medium transition-colors opacity-50 cursor-not-allowed">
                        📦 Pedidos (Próx.)
                    </Link>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={() => {
                            document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                            window.location.href = '/admin/login';
                        }}
                        className="w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>

            {/* Global Expenses Modal */}
            {showExpensesModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-xl w-full bg-white rounded-[2.5rem] p-8 shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Registrar Gastos</h2>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Ciclo Operativo Semanal</p>
                            </div>
                            <button onClick={() => setShowExpensesModal(false)} className="text-gray-400 hover:text-gray-600 font-black text-xl">✕</button>
                        </div>

                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {tempExpenses.map((expense, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Descripción (ej. Insumos)"
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/10 transition-all outline-none"
                                        value={expense.reason}
                                        onChange={(e) => handleExpenseChange(idx, 'reason', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="$ 0.00"
                                        className="w-24 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-red-600 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/10 transition-all outline-none"
                                        value={expense.amount}
                                        onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={addExpenseRow}
                                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-black text-xs hover:border-[#4A5D23]/20 hover:text-[#4A5D23] transition-all uppercase tracking-widest"
                            >
                                (+) Agregar más gastos
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExpensesModal(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveExpenses}
                                    className="flex-[2] py-4 bg-[#4A5D23] text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-[#4A5D23]/20 transition-all uppercase tracking-widest"
                                >
                                    Guardar Gastos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}