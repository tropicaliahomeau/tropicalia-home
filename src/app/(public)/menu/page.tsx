'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './menu.module.css';
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
    const [selectedWeekId, setSelectedWeekId] = useState<string>(MENUS[0].id);
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'drinks'>('daily');

    const currentMenu = MENUS.find(m => m.id === selectedWeekId) || MENUS[0];

    // Logic to lock future weeks (Only Week 1 is 'active' for purchase in this demo)
    const isOrderingEnabled = currentMenu.id === 'week-1';

    // pricing calculation integrated with UserContext cart
    const calculateTotal = () => {
        const isFullWeek = cart.meals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : (cart.meals.length * 18.00);
        const extrasCost = cart.extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        return {
            total: daysCost + extrasCost,
            daysCost,
            extrasCost,
            isFullWeek
        };
    };

    const { total, isFullWeek } = calculateTotal();

    const toggleMeal = (meal: any) => {
        if (!isOrderingEnabled) return;
        if (cart.meals.includes(meal.id)) {
            removeFromCart('meal', meal.id);
        } else {
            addToCart('meal', meal);
        }
    };

    const selectFullWeek = () => {
        if (!isOrderingEnabled) return;
        currentMenu.meals.forEach(m => {
            if (!cart.meals.includes(m.id)) {
                addToCart('meal', m);
            }
        });
    };

    // Available extras (matches the ones in UserContext mock but defined here for UI)
    const availableExtras = [
        { id: '1', name: 'Pony Malta', price: 3.50 },
        { id: '2', name: 'Colombiana', price: 3.00 },
        { id: '3', name: 'Manzana Postobón', price: 3.00 },
    ];

    const handleNext = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        router.push('/checkout/review');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={styles.container}>
                <div className="text-center mb-10">
                    <p className="text-[#4A5D23] font-bold uppercase tracking-widest text-sm mb-2">Paso 1 de 3: Selección</p>
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Menú Semanal - {currentMenu.name}</h1>
                    <p className="text-gray-600 text-lg italic">Selecciona tus almuerzos. ¡Pide 5 días por solo $85!</p>
                </div>

                {/* Week Selector */}
                <div className="flex justify-center mb-8 gap-4 overflow-x-auto pb-4">
                    {MENUS.map(week => (
                        <button
                            key={week.id}
                            onClick={() => {
                                setSelectedWeekId(week.id);
                            }}
                            className={`px-6 py-2 rounded-full transition-all whitespace-nowrap font-medium ${selectedWeekId === week.id
                                ? 'bg-[#4A5D23] text-white shadow-lg transform scale-105'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {week.name}
                        </button>
                    ))}
                </div>

                <div className="mb-8 flex flex-col items-center gap-3">
                    {!isOrderingEnabled && (
                        <div className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full font-medium border border-gray-200 mb-4">
                            🔒 Esta semana solo está disponible para visualización
                        </div>
                    )}

                    {/* Desktop View Mode Toggle (Por Días / Semana / Bebidas) */}
                    {isOrderingEnabled && (
                        <>
                            <div className="bg-white rounded-full p-2 border border-gray-200 shadow-sm flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => setViewMode('daily')}
                                    className={`px-8 py-3 rounded-full font-bold text-sm transition-all focus:outline-none ${viewMode === 'daily'
                                        ? 'bg-white shadow-md text-[#4A5D23]'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Por Días
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('weekly');
                                        selectFullWeek();
                                    }}
                                    className={`px-8 py-3 rounded-full font-bold text-sm transition-all focus:outline-none ${viewMode === 'weekly'
                                        ? 'bg-white shadow-md text-[#4A5D23]'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Semana Completa
                                </button>
                                <button
                                    onClick={() => setViewMode('drinks')}
                                    className={`px-8 py-3 rounded-full font-bold text-sm transition-all focus:outline-none ${viewMode === 'drinks'
                                        ? 'bg-white shadow-md text-[#4A5D23]'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Bebidas
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mt-2 text-center">
                                {viewMode === 'daily' && 'Selecciona los días individualmente haciendo clic en cada tarjeta.'}
                                {viewMode === 'weekly' && '¡Excelente elección! Has seleccionado la semana completa con descuento.'}
                                {viewMode === 'drinks' && 'Acompaña tu almuerzo con el auténtico sabor colombiano.'}
                            </p>
                        </>
                    )}
                </div>

                {/* Main Content Layout - Grid with Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                            {viewMode !== 'drinks' ? (
                                currentMenu.meals.map((meal) => (
                                    <div
                                        key={meal.id}
                                        onClick={() => toggleMeal(meal)}
                                        className={`
                                                relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group
                                                ${cart.meals.includes(meal.id) ? 'border-[#4A5D23] ring-2 ring-[#4A5D23]/10 shadow-xl transform scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'}
                                                ${!isOrderingEnabled ? 'opacity-70 grayscale-[0.5] cursor-not-allowed pointer-events-none' : ''}
                                            `}
                                    >
                                        {/* Day Label */}
                                        <div className="bg-[#4A5D23] text-white text-center py-1.5 text-xs font-black tracking-widest uppercase">
                                            {meal.day}
                                        </div>

                                        {/* Image */}
                                        <div className="relative h-48 w-full bg-gray-100">
                                            <Image
                                                src={meal.image}
                                                alt={meal.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            {cart.meals.includes(meal.id) && (
                                                <div className="absolute inset-0 bg-[#4A5D23]/30 flex items-center justify-center backdrop-blur-[2px] animate-fade-in">
                                                    <div className="bg-white text-[#4A5D23] rounded-full p-3 shadow-2xl transform scale-110">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col h-full">
                                            <h3 className="font-black text-gray-800 text-lg mb-2 leading-tight group-hover:text-[#4A5D23] transition-colors">{meal.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{meal.description}</p>

                                            {isOrderingEnabled ? (
                                                <button
                                                    className={`w-full py-3 rounded-xl text-sm font-black transition-all mt-auto border-2
                                                            ${cart.meals.includes(meal.id)
                                                            ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                                                            : 'bg-white border-gray-100 text-gray-700 hover:border-[#4A5D23] hover:text-[#4A5D23]'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleMeal(meal);
                                                    }}
                                                >
                                                    {cart.meals.includes(meal.id) ? 'QUITAR DÍA' : 'SELECCIONAR'}
                                                </button>
                                            ) : (
                                                <div className="mt-auto pt-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Agotado</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* DRINKS SECTION (Visible only when viewMode === 'drinks') */
                                availableExtras.map((extra) => {
                                    const cartItem = cart.extras.find((e) => e.id === extra.id);
                                    const quantity = cartItem ? cartItem.quantity : 0;

                                    return (
                                        <div key={extra.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{extra.name}</h4>
                                                <p className="text-sm text-gray-500">${extra.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
                                                <button
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${quantity > 0 ? 'bg-white text-gray-600 shadow-sm hover:text-red-500' : 'text-gray-300 cursor-not-allowed'}`}
                                                    onClick={() => updateCartExtraQuantity(extra.id, -1)}
                                                    disabled={quantity === 0}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="font-black w-4 text-center text-gray-800">{quantity}</span>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4A5D23] text-white shadow-sm hover:bg-[#3a491c] transition-colors"
                                                    onClick={() => {
                                                        if (quantity === 0) {
                                                            addToCart('extra', { ...extra, quantity: 1 });
                                                        } else {
                                                            updateCartExtraQuantity(extra.id, 1);
                                                        }
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Side: Sidebar (TU CANASTA) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50">
                            <h2 className="text-[#4A5D23] font-black text-2xl mb-8 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                TU CANASTA
                            </h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-none">Total estimativo</span>
                                    <span className="text-4xl font-black text-gray-900 leading-none">${total.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{cart.meals.length} Almuerzos</span>
                                        <span className="font-black text-gray-700">
                                            {isFullWeek ? '$85.00' : `$${(cart.meals.length * 18).toFixed(2)}`}
                                        </span>
                                    </div>

                                </div>

                                {isFullWeek && (
                                    <div className="bg-green-100 text-[#4A5D23] text-[10px] font-black p-2 rounded-lg text-center uppercase tracking-widest animate-pulse">
                                        ✨ Ahorro aplicado: Semana Completa
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
                                Siguiente →
                            </button>

                            <p className="text-[10px] text-gray-400 mt-6 text-center font-bold leading-relaxed uppercase tracking-tighter">
                                Al dar clic en siguiente pasarás a revisar los detalles de tu pedido.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Persistent Bottom Bar for Mobile Only */}
                {cart.meals.length > 0 && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] p-4 z-50 animate-slide-up">
                        <div className="container mx-auto flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total compra</span>
                                <span className="text-2xl font-black text-[#4A5D23]">${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleNext}
                                className="bg-[#4A5D23] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-[#4A5D23]/20 transition-all active:scale-95"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
