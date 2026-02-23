'use client';

import { useState } from 'react';
import { MENUS } from '@/data/menus';
import Image from 'next/image';

export default function AdminMenuPage() {
    const [selectedWeekId, setSelectedWeekId] = useState<string>(MENUS[0].id);
    const currentMenu = MENUS.find(m => m.id === selectedWeekId) || MENUS[0];

    // Mock state for editing (won't persist without backend)
    const [editingItem, setEditingItem] = useState<number | null>(null);

    const handleSave = (id: number) => {
        // Here we would call the API to update the item
        console.log(`Saving item ${id}...`);
        setEditingItem(null);
        alert("Cambios guardados (Simulación)");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Gestión de Menús</h2>
                    <p className="text-gray-500 mt-1">Edita los platos y fotos para cada semana.</p>
                </div>
            </header>

            {/* Week Selector */}
            <div className="flex gap-4 border-b border-gray-200 pb-4">
                {MENUS.map(week => (
                    <button
                        key={week.id}
                        onClick={() => setSelectedWeekId(week.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedWeekId === week.id
                            ? 'bg-[#4A5D23] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {week.name} {week.id === 'week-1' ? '(Activa)' : '(Bloqueada)'}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 gap-6">
                {currentMenu.meals.map((meal) => (
                    <div key={meal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6">

                        {/* Image Preview & Edit */}
                        <div className="w-48 h-32 relative shrink-0 bg-gray-100 rounded-xl overflow-hidden group">
                            <Image
                                src={meal.image}
                                alt={meal.title}
                                fill
                                className="object-cover group-hover:opacity-75 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    Cambiar Foto
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-[#4A5D23] bg-[#4A5D23]/10 px-2 py-0.5 rounded uppercase tracking-wide">
                                    {meal.day}
                                </span>
                                <button
                                    className="text-gray-400 hover:text-[#4A5D23]"
                                    onClick={() => setEditingItem(meal.id === editingItem ? null : meal.id)}
                                >
                                    {editingItem === meal.id ? 'Cancelar' : 'Editar'}
                                </button>
                            </div>

                            {editingItem === meal.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        defaultValue={meal.title}
                                        className="w-full text-lg font-bold border-b border-gray-300 focus:border-[#4A5D23] outline-none py-1"
                                    />
                                    <textarea
                                        defaultValue={meal.description}
                                        className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-2 focus:border-[#4A5D23] outline-none h-20"
                                    />
                                    <button
                                        onClick={() => handleSave(meal.id)}
                                        className="bg-[#4A5D23] text-white px-4 py-1.5 rounded-lg text-sm font-bold"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-800">{meal.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{meal.description}</p>
                                    <div className="flex gap-2">
                                        {meal.tags.map(tag => (
                                            <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
