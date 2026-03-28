'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './menu.module.css';
import { supabase } from '@/lib/supabaseClient';
import { MENUS } from '@/data/menus';

export default function MenuPage() {
    const {
        user,
        cart,
        addToCart,
        removeFromCart,
        updateCartExtraQuantity
    } = useUser();

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'days' | 'week' | 'extras'>('days');
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
    const [extraItems, setExtraItems] = useState<any[]>([]);
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
    const [allWeeks, setAllWeeks] = useState<any[]>([]);

    const TABS = [
        { id: 'days', label: 'By Day' },
        { id: 'week', label: 'Full Week' },
        { id: 'extras', label: 'Drinks (Others)' }
    ] as const;

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch weekly_menus to know which week is active
                const { data: weeksData, error: weeksError } = await supabase
                    .from('weekly_menus')
                    .select('*')
                    .order('start_date', { ascending: true });
                
                if (!weeksError && weeksData) {
                    setAllWeeks(weeksData);
                    const activeWk = weeksData.find(w => w.is_enabled === true);
                    if (activeWk) {
                        setActiveWeekId(activeWk.id);
                        setSelectedWeek(activeWk.id); // set automatically
                    } else {
                        setActiveWeekId(null);
                        setSelectedWeek(weeksData[0]?.id || null);
                    }
                }

                // Fetch items that are NOT main meals
                const { data, error } = await supabase
                    .from('menu_items')
                    .select('*')
                    .in('categoria', ['bebida', 'postre', 'acompañante', 'extra'])
                    .eq('disponible', true);
                
                if (error) {
                    console.error('Error fetching extras:', error);
                } else if (data) {
                    setExtraItems(data);
                }
            } catch (err) {
                console.error('Unexpected error fetching extras:', err);
            } finally {
                setLoadingExtras(false);
            }
        }
        fetchData();
    }, []);

    const toggleMeal = (item: any) => {
        if (selectedWeek !== activeWeekId) return; // Prevent adding from inactive week
        if (cart.meals.some(m => m.id === item.id)) {
            removeFromCart('meal', item.id);
        } else {
            addToCart('meal', { 
                id: item.id, 
                title: item.title, 
                day: item.day, 
                image: item.image || 'https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800&q=80', 
                price: 18.00 
            });
        }
    };

    const addFullWeek = (meals: any[]) => {
        if (selectedWeek !== activeWeekId) return; // Prevent adding from inactive week
        // Clear existing meals before adding full week to avoid duplicates or miscounting
        cart.meals.forEach(m => removeFromCart('meal', m.id));
        // Add all 5 meals
        meals.forEach(item => {
            addToCart('meal', { 
                id: item.id, 
                title: item.title, 
                day: item.day, 
                image: item.image || 'https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800&q=80', 
                price: 18.00 
            });
        });
    };

    const calculateTotal = () => {
        const isFullWeek = cart.meals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : cart.meals.reduce((acc, m) => acc + (m.price || 18.00), 0);
        const extrasCost = cart.extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        return {
            total: daysCost + extrasCost,
            daysCost,
            extrasCost,
            isFullWeek
        };
    };

    const { total, isFullWeek, daysCost, extrasCost } = calculateTotal();

    const handleNext = () => {
        router.push('/checkout/review');
    };

    const currentWeekData = MENUS.find(w => w.id === selectedWeek);



    return (
        <div className="container mx-auto px-4 py-8">
            <div className={styles.container}>
                <div className="text-center mb-10">
                    <p className="text-[#4A5D23] font-bold uppercase tracking-widest text-sm mb-2">Step 1 of 3: Selection</p>
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Tropicalia Menu</h1>
                    <p className="text-gray-600 text-lg italic">Select your favorite dishes organized by category.</p>
                </div>

                {/* Week Selector Tabs */}
                {allWeeks.length > 0 && (
                    <div className="flex justify-center mb-6 gap-2 flex-wrap">
                        {allWeeks.map(wk => (
                            <button
                                key={wk.id}
                                onClick={() => setSelectedWeek(wk.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedWeek === wk.id ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {wk.title}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Tabs */}
                <div className="flex justify-center mb-6 gap-4 overflow-x-auto pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'days' | 'week' | 'extras')}
                            className={`px-6 py-2 rounded-full transition-all whitespace-nowrap font-bold ${activeTab === tab.id
                                ? 'bg-[#4A5D23] text-white shadow-lg transform scale-105'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Tabs */}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {selectedWeek !== activeWeekId && (
                            <div className="mb-6 p-3 bg-gray-50 rounded-xl text-center border border-gray-200">
                                <p className="text-gray-500 font-bold text-sm">🔒 This week is not available for ordering yet</p>
                            </div>
                        )}

                        {/* 1. POR DÍAS */}
                        {activeTab === 'days' && currentWeekData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                                {currentWeekData.meals.map((meal) => {
                                    const isSelected = cart.meals.some(m => m.id === meal.id);
                                    return (
                                        <div
                                            key={meal.id}
                                            onClick={() => toggleMeal(meal)}
                                            className={`
                                                relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col
                                                ${isSelected ? 'border-[#4A5D23] ring-2 ring-[#4A5D23]/10 shadow-xl transform scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'}
                                            `}
                                        >
                                            <div className="bg-[#4A5D23] text-white text-center py-1.5 text-xs font-black tracking-widest uppercase">
                                                {meal.day}
                                            </div>
                                            <div className="relative h-48 w-full bg-gray-100">
                                                {meal.image ? (
                                                    <Image src={meal.image} alt={meal.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#4A5D23]/30 flex items-center justify-center backdrop-blur-[2px] animate-fade-in">
                                                        <div className="bg-white text-[#4A5D23] rounded-full p-3 shadow-2xl transform scale-110">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex flex-col h-full bg-white relative z-10">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3 className="font-black text-gray-800 text-lg leading-tight group-hover:text-[#4A5D23] transition-colors">{meal.title}</h3>
                                                    <span className="font-black text-[#4A5D23] whitespace-nowrap">$18.00</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{meal.description}</p>

                                                {selectedWeek === activeWeekId ? (
                                                    <button
                                                        className={`mt-auto w-full py-3 rounded-xl text-sm font-black transition-all border-2
                                                                ${isSelected
                                                                ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                                                                : 'bg-white border-gray-100 text-gray-700 hover:border-[#4A5D23] hover:text-[#4A5D23]'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMeal(meal);
                                                        }}
                                                    >
                                                        {isSelected ? 'REMOVE' : 'SELECT'}
                                                    </button>
                                                ) : (
                                                    <button disabled className="mt-auto w-full py-3 rounded-xl text-sm font-black transition-all border-2 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed">
                                                        Not Available
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 2. SEMANA COMPLETA */}
                        {activeTab === 'week' && currentWeekData && (
                            <div className="mb-12">
                                <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 border border-green-100 text-center shadow-lg hover:shadow-xl transition-all max-w-2xl mx-auto">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-800 mb-2">5-Day Package</h2>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Secure your lunches from Monday to Friday with our special offer.</p>
                                    
                                    <ul className="text-left max-w-xs mx-auto mb-8 space-y-3">
                                        {currentWeekData.meals.map((meal) => (
                                            <li key={meal.id} className="flex gap-2 text-sm text-gray-700">
                                                <span className="font-bold text-[#4A5D23] w-16">{meal.day.substring(0,3)}.</span> 
                                                <span className="truncate">{meal.title}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <span className="text-gray-400 line-through text-xl">$90.00</span>
                                        <span className="text-5xl font-black text-[#4A5D23]">$85.00</span>
                                    </div>

                                    {selectedWeek === activeWeekId ? (
                                        <button 
                                            className="bg-[#4A5D23] text-white w-full py-4 rounded-full font-black text-lg hover:bg-[#3a491c] hover:scale-105 transition-all shadow-xl shadow-[#4A5D23]/30"
                                            onClick={() => addFullWeek(currentWeekData.meals)}
                                        >
                                            Add Full Week
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-full font-black text-lg bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed">
                                            Not Available
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. BEBIDAS Y EXTRAS */}
                        {activeTab === 'extras' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                                {loadingExtras ? (
                                    <div className="col-span-full flex justify-center py-20">
                                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A5D23]"></div>
                                    </div>
                                ) : extraItems.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl">
                                        No drinks or extras added to the database at the moment.
                                    </div>
                                ) : (
                                    extraItems.map((item) => {
                                        const cartItem = cart.extras.find(e => e.id === item.id);
                                        const quantity = cartItem ? cartItem.quantity : 0;

                                        return (
                                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                                                {item.imagen_url && (
                                                    <div className="relative h-32 w-full mb-4 bg-gray-100 rounded-xl overflow-hidden">
                                                        <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div className="mb-4">
                                                    <h4 className="font-bold text-gray-800">{item.nombre}</h4>
                                                    <p className="text-sm text-gray-400 line-clamp-2">{item.descripcion}</p>
                                                    <p className="text-lg font-black text-[#4A5D23] mt-2">${item.precio?.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-full p-2 border border-gray-100 mt-auto">
                                                    <button
                                                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${quantity > 0 ? 'bg-white text-gray-600 shadow-sm hover:text-red-500' : 'text-gray-300 cursor-not-allowed'}`}
                                                        onClick={() => updateCartExtraQuantity(item.id, -1)}
                                                        disabled={quantity === 0}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <span className="font-black text-lg w-6 text-center text-gray-800">{quantity}</span>
                                                    <button
                                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4A5D23] text-white shadow-sm hover:bg-[#3a491c] transition-colors"
                                                        onClick={() => {
                                                            if (quantity === 0) {
                                                                addToCart('extra', { id: item.id, name: item.nombre, price: item.precio });
                                                            } else {
                                                                updateCartExtraQuantity(item.id, 1);
                                                            }
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Sidebar (TU CANASTA) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50">
                            <h2 className="text-[#4A5D23] font-black text-2xl mb-8 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                YOUR CART
                            </h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-none">Estimated total</span>
                                    <span className="text-4xl font-black text-gray-900 leading-none">${total.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{cart.meals.length} Meals</span>
                                        <span className="font-black text-gray-700">
                                            {isFullWeek ? '$85.00' : `$${daysCost.toFixed(2)}`}
                                        </span>
                                    </div>
                                    {cart.extras.length > 0 && (
                                        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                                            <span className="text-gray-500">Extras / Drinks</span>
                                            <span className="font-black text-gray-700">${extrasCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {isFullWeek && (
                                    <div className="bg-green-100 text-[#4A5D23] text-[10px] font-black p-2 rounded-lg text-center uppercase tracking-widest animate-pulse">
                                        ✨ Savings applied: 5+ Meals
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={cart.meals.length === 0 && cart.extras.length === 0}
                                className={`
                                    w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                                    ${(cart.meals.length === 0 && cart.extras.length === 0)
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-[#4A5D23] text-white hover:bg-[#3a491c] hover:scale-[1.02] shadow-[#4A5D23]/30'}
                                `}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
