'use client';

import { useState, useEffect } from 'react';
import { MENUS } from '@/data/menus';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function AdminMenuPage() {
    const [selectedWeekId, setSelectedWeekId] = useState<string>(MENUS[0].id);
    const [weeksData, setWeeksData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'weekly' | 'extras'>('weekly');
    const [extrasData, setExtrasData] = useState<any[]>([]);
    const [loadingExtras, setLoadingExtras] = useState(false);
    
    // Auth & Edit state
    const currentMenu = MENUS.find(m => m.id === selectedWeekId) || MENUS[0];
    const [editingItem, setEditingItem] = useState<number | null>(null);
    const [editingExtra, setEditingExtra] = useState<any>(null);
    const [isAddingExtra, setIsAddingExtra] = useState(false);

    const fetchWeeks = async () => {
        try {
            const { data, error } = await supabase.from('weekly_menus').select('*');
            if (data && !error) {
                setWeeksData(data);
                const active = data.find(w => w.activo);
                if (active) setSelectedWeekId(active.id);
            }
        } catch (e) {
            console.error('Error fetching weeks', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchExtras = async () => {
        setLoadingExtras(true);
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .in('categoria', ['bebida', 'postre', 'acompañante', 'extra'])
                .order('created_at', { ascending: false });
            if (data && !error) {
                setExtrasData(data);
            }
        } catch (e) {
            console.error('Error fetching extras', e);
        } finally {
            setLoadingExtras(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'weekly') {
            fetchWeeks();
        } else {
            fetchExtras();
        }
    }, [activeTab]);

    const toggleWeekEnabled = async (weekId: string, enable: boolean) => {
        try {
            if (enable) {
                // PRIMERO: deshabilitar TODAS las semanas
                await supabase
                    .from('weekly_menus')
                    .update({ is_enabled: false })
                    .neq('id', weekId);
                
                // SEGUNDO: habilitar la seleccionada
                await supabase
                    .from('weekly_menus')
                    .update({ is_enabled: true })
                    .eq('id', weekId);
                alert('✅ Week Enabled. Customers can now place orders.');
            } else {
                // Solo deshabilitar esta
                await supabase
                    .from('weekly_menus')
                    .update({ is_enabled: false })
                    .eq('id', weekId);
                alert('🔒 Week disabled.');
            }
            // Refrescar estado local
            await fetchWeeks();
        } catch (e) {
            console.error('Error toggling week', e);
            alert('Failed to update week status.');
        }
    };

    const handleSave = (id: number) => {
        // Here we would call the API to update the item
        console.log(`Saving item ${id}...`);
        setEditingItem(null);
        alert("Cambios guardados (Simulación)");
    };

    // Extras CRUD handlers
    const handleSaveExtra = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isAddingExtra) {
                const { error } = await supabase.from('menu_items').insert([{
                    nombre: editingExtra.nombre,
                    descripcion: editingExtra.descripcion,
                    precio: parseFloat(editingExtra.precio || 0),
                    categoria: editingExtra.categoria || 'extra',
                    imagen_url: editingExtra.imagen_url || null,
                    disponible: editingExtra.disponible !== undefined ? editingExtra.disponible : true
                }]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('menu_items').update({
                    nombre: editingExtra.nombre,
                    descripcion: editingExtra.descripcion,
                    precio: parseFloat(editingExtra.precio || 0),
                    categoria: editingExtra.categoria,
                    imagen_url: editingExtra.imagen_url,
                    disponible: editingExtra.disponible
                }).eq('id', editingExtra.id);
                if (error) throw error;
            }
            setIsAddingExtra(false);
            setEditingExtra(null);
            fetchExtras();
        } catch (err: any) {
            alert('Failed to save extra item: ' + err.message);
        }
    };

    const handleDeleteExtra = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            fetchExtras();
        } catch (err: any) {
            alert('Failed to delete item: ' + err.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
                    <p className="text-gray-500 mt-1">Manage weekly dishes and drinks/extras.</p>
                </div>
            </header>

            {/* Main Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2 mb-6">
                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-6 py-2 rounded-t-lg font-bold transition-colors border-b-4 ${activeTab === 'weekly' ? 'border-[#4A5D23] text-[#4A5D23]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Weekly Meals
                </button>
                <button
                    onClick={() => setActiveTab('extras')}
                    className={`px-6 py-2 rounded-t-lg font-bold transition-colors border-b-4 ${activeTab === 'extras' ? 'border-[#4A5D23] text-[#4A5D23]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Drinks & Others
                </button>
            </div>

            {activeTab === 'weekly' ? (
                <>
                    {/* Week Selector */}
            {loading ? (
                <div className="py-4 text-gray-500">Loading weeks...</div>
            ) : (
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
                    <div className="flex gap-4 overflow-x-auto">
                        {MENUS.map(week => {
                            const dbWeek = weeksData.find(w => w.id === week.id);
                            const isEnabled = dbWeek?.is_enabled === true;
                            
                            return (
                                <div key={week.id} className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${isEnabled ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-gray-50 opacity-80'}`}>
                                    <button
                                        onClick={() => setSelectedWeekId(week.id)}
                                        className={`px-6 py-3 rounded-lg font-bold transition-all w-full ${selectedWeekId === week.id
                                            ? 'bg-gray-800 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            }`}
                                    >
                                        {week.name} {isEnabled && '🔓'} {!isEnabled && '🔒'}
                                    </button>
                                    
                                    {isEnabled ? (
                                        <button 
                                            onClick={() => toggleWeekEnabled(week.id, false)}
                                            className="w-full text-xs font-black text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 uppercase tracking-widest shadow-sm shadow-green-600/20"
                                        >
                                            Deshabilitar Semana
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => toggleWeekEnabled(week.id, true)}
                                            className="w-full text-xs font-bold text-gray-600 border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-200 hover:border-gray-400 uppercase tracking-widest"
                                        >
                                            Habilitar Semana
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
                </>
            ) : (
                /* EXTRAS TAB */
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setIsAddingExtra(true);
                                setEditingExtra({
                                    nombre: '',
                                    descripcion: '',
                                    precio: 0,
                                    categoria: 'bebida',
                                    disponible: true,
                                    imagen_url: ''
                                });
                            }}
                            className="bg-[#4A5D23] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#3a491c] transition-colors"
                        >
                            + Add New Item
                        </button>
                    </div>

                    {(isAddingExtra || editingExtra) && !isAddingExtra === false && editingExtra !== null ? (
                        /* CRUD Form Modal */
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                            <form onSubmit={handleSaveExtra} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                                <h3 className="text-2xl font-black mb-6 border-b pb-4 text-gray-800">
                                    {isAddingExtra ? 'Add New Item' : 'Edit Item'}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                                        <input required type="text" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#4A5D23]/30 font-medium" value={editingExtra.nombre} onChange={e => setEditingExtra({ ...editingExtra, nombre: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                        <textarea required className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#4A5D23]/30 text-sm h-24" value={editingExtra.descripcion} onChange={e => setEditingExtra({ ...editingExtra, descripcion: e.target.value })} />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Price ($)</label>
                                            <input required type="number" step="0.01" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#4A5D23]/30 font-bold text-[#4A5D23]" value={editingExtra.precio} onChange={e => setEditingExtra({ ...editingExtra, precio: e.target.value })} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                                            <select className="w-full border rounded-lg p-3 outline-none bg-white font-medium" value={editingExtra.categoria} onChange={e => setEditingExtra({ ...editingExtra, categoria: e.target.value })}>
                                                <option value="bebida">Drink</option>
                                                <option value="postre">Dessert</option>
                                                <option value="acompañante">Side</option>
                                                <option value="extra">Extra</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                                        <input type="url" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#4A5D23]/30 text-sm" value={editingExtra.imagen_url || ''} onChange={e => setEditingExtra({ ...editingExtra, imagen_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="flex items-center gap-3 py-2">
                                        <input type="checkbox" id="disponible" className="w-5 h-5 text-[#4A5D23] rounded focus:ring-[#4A5D23]" checked={editingExtra.disponible} onChange={e => setEditingExtra({ ...editingExtra, disponible: e.target.checked })} />
                                        <label htmlFor="disponible" className="text-sm font-bold text-gray-700">Available to customers</label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                    <button type="button" onClick={() => { setIsAddingExtra(false); setEditingExtra(null); }} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-[#4A5D23] text-white hover:bg-[#3a491c] transition-colors shadow-lg shadow-[#4A5D23]/20">
                                        Save Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : null}

                    {/* Extras Grid */}
                    {loadingExtras ? (
                        <div className="py-8 text-center text-gray-500">Loading extras...</div>
                    ) : extrasData.length === 0 ? (
                        <div className="py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
                            No drinks or extras found. Add some to get started!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {extrasData.map(item => (
                                <div key={item.id} className={`bg-white rounded-2xl shadow-sm border ${item.disponible ? 'border-gray-100' : 'border-red-100 opacity-75'} overflow-hidden flex flex-col`}>
                                    {item.imagen_url && (
                                        <div className="relative h-40 w-full bg-gray-100">
                                            <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                                            {!item.disponible && (
                                                <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] flex items-center justify-center">
                                                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">Unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 text-lg">{item.nombre}</h3>
                                            <span className="font-black text-[#4A5D23]">${Number(item.precio).toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.descripcion}</p>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider bg-gray-50 px-2 py-1 rounded">
                                                {item.categoria}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setIsAddingExtra(false); setEditingExtra(item); }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-black text-gray-600 hover:text-[#4A5D23] hover:bg-green-50 transition-colors uppercase"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExtra(item.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-black text-red-500 hover:bg-red-50 transition-colors uppercase"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
