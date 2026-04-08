'use client';

import { useEffect, useState } from 'react';

interface Expense {
    reason: string;
    amount: number;
    date: string;
}

export default function AdminFinance() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<Expense | null>(null);

    useEffect(() => {
        const loadExpenses = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('tropicalia_expenses') || '[]');
                // Sort by date descending
                const sorted = saved.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setExpenses(sorted);
            } catch (error) {
                console.error("Failed to load expenses", error);
            } finally {
                setLoading(false);
            }
        };
        loadExpenses();
    }, []);

    const handleDelete = (index: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
            const updated = expenses.filter((_, i) => i !== index);
            setExpenses(updated);
            localStorage.setItem('tropicalia_expenses', JSON.stringify(updated));
        }
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditValue(expenses[index]);
    };

    const handleSaveEdit = () => {
        if (editIndex !== null && editValue) {
            const updated = [...expenses];
            updated[editIndex] = editValue;
            setExpenses(updated);
            localStorage.setItem('tropicalia_expenses', JSON.stringify(updated));
            setEditIndex(null);
            setEditValue(null);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Management</h1>
                    <p className="text-gray-500 font-medium">Consulta, edita y administra los egresos registrados</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Acumulado</p>
                    <p className="text-2xl font-black text-red-600">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto / Motivo</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest font-sans">Cargando registros...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-gray-400 font-bold text-sm italic">No se han encontrado gastos registrados.</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-500">
                                                {new Date(expense.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {editIndex === idx ? (
                                                <input
                                                    type="text"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-[#4A5D23]/10 outline-none"
                                                    value={editValue?.reason}
                                                    onChange={(e) => setEditValue({ ...editValue!, reason: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{expense.reason}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {editIndex === idx ? (
                                                <input
                                                    type="number"
                                                    className="w-32 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-black text-red-600 text-right focus:ring-2 focus:ring-[#4A5D23]/10 outline-none"
                                                    value={editValue?.amount}
                                                    onChange={(e) => setEditValue({ ...editValue!, amount: parseFloat(e.target.value) })}
                                                />
                                            ) : (
                                                <span className="text-lg font-black text-red-600">
                                                    -${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {editIndex === idx ? (
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="bg-[#4A5D23] text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                                                    >
                                                        Guardar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(idx)}
                                                            className="p-2 text-gray-400 hover:text-[#4A5D23] hover:bg-[#4A5D23]/5 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(idx)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xl">💡</span>
                </div>
                <div>
                    <h4 className="font-black text-orange-900 text-sm uppercase tracking-tight">Nota de Administración</h4>
                    <p className="text-orange-800/70 text-sm font-medium mt-1 leading-relaxed">
                        Para registrar nuevos gastos, utiliza el botón rojo <span className="font-black text-red-600">"Registrar Gastos"</span> desde el Dashboard principal.
                        Esta sección está diseñada específicamente para el control, auditoría y corrección de egresos ya ingresados.
                    </p>
                </div>
            </div>
        </div>
    );
}

