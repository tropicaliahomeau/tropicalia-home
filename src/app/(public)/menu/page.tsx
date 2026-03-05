'use client';

import { useState } from 'react';
import { useUser, Subscription } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './menu.module.css';
import { MENUS } from '@/data/menus';

export default function MenuPage() {
    const { user, updateSubscription } = useUser();
    const router = useRouter();
    const [selectedWeekId, setSelectedWeekId] = useState<string>(MENUS[0].id);
    const [selectedMeals, setSelectedMeals] = useState<number[]>([]);

    // Extras State
    const [extras, setExtras] = useState<{ id: string, name: string, price: number, quantity: number }[]>([
        { id: '1', name: 'Pony Malta', price: 3.50, quantity: 0 },
        { id: '2', name: 'Colombiana', price: 3.00, quantity: 0 },
        { id: '3', name: 'Manzana Postobón', price: 3.00, quantity: 0 },
    ]);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'auto' | 'payid'>('payid');
    const [payIdProofBase64, setPayIdProofBase64] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPayIdProofBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPayIdProofBase64(null);
        }
    };

    const currentMenu = MENUS.find(m => m.id === selectedWeekId) || MENUS[0];

    // Logic to lock future weeks (Only Week 1 is 'active' for purchase in this demo)
    const isOrderingEnabled = currentMenu.id === 'week-1';

    // Pricing Calculation
    const calculateTotal = () => {
        const isFullWeek = selectedMeals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : (selectedMeals.length * 18.00);

        const extrasCost = extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        return {
            total: daysCost + extrasCost,
            daysCost,
            extrasCost,
            isFullWeek
        };
    };

    const { total, daysCost, isFullWeek } = calculateTotal();

    const toggleMeal = (id: number) => {
        if (!isOrderingEnabled) return;
        if (selectedMeals.includes(id)) {
            setSelectedMeals(selectedMeals.filter(mealId => mealId !== id));
        } else {
            setSelectedMeals([...selectedMeals, id]);
        }
    };

    const selectFullWeek = () => {
        if (!isOrderingEnabled) return;
        const allMealIds = currentMenu.meals.map(m => m.id);
        setSelectedMeals(allMealIds);
    };

    const updateExtraQuantity = (id: string, change: number) => {
        setExtras(extras.map(e => {
            if (e.id === id) {
                const newQty = Math.max(0, e.quantity + change);
                return { ...e, quantity: newQty };
            }
            return e;
        }));
    };

    const handleSubscribe = () => {
        if (!user) {
            alert("Please log in to subscribe!");
            router.push('/login');
            return;
        }

        if (paymentMethod === 'payid' && !payIdProofBase64) {
            return; // Button is disabled, but guard for safety
        }

        const orderDetails: Subscription = {
            status: 'Pending Validation',
            planName: `${selectedMeals.length} Días (${isFullWeek ? 'Semana Completa' : 'Flexible'})`,
            meals: selectedMeals,
            extras: extras.filter(e => e.quantity > 0),
            total,
            paymentMethod: paymentMethod as 'auto' | 'payid',
            payIdProof: payIdProofBase64
        };

        console.log("Processing Order:", orderDetails);
        updateSubscription(orderDetails);

        const confirmMsg = paymentMethod === 'payid'
            ? `✅ Pago recibido. Tu pedido está PENDIENTE de aprobación por parte del administrador. Total: $${total}`
            : `✅ ¡Suscripción confirmada! Total: $${total}`;

        alert(confirmMsg);
        router.push('/dashboard');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={styles.container}>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Menú Semanal - {currentMenu.name}</h1>
                    <p className="text-gray-600 text-lg">Selecciona tus almuerzos. ¡Pide 5 días por solo $85!</p>
                </div>

                {/* Week Selector */}
                <div className="flex justify-center mb-8 gap-4 overflow-x-auto pb-4">
                    {MENUS.map(week => (
                        <button
                            key={week.id}
                            onClick={() => {
                                setSelectedWeekId(week.id);
                                setSelectedMeals([]);
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

                {/* Selection Controls */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    {isOrderingEnabled ? (
                        <>
                            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
                                <button
                                    onClick={() => setSelectedMeals([])}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedMeals.length === 0 ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Por Días
                                </button>
                                <button
                                    onClick={() => {
                                        const allMealIds = currentMenu.meals.map(m => m.id);
                                        setSelectedMeals(allMealIds);
                                    }}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedMeals.length === 5 ? 'bg-[#4A5D23] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Semana Completa
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                O selecciona los días individualmente haciendo clic en cada tarjeta.
                            </p>
                        </>
                    ) : (
                        <div className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full font-medium border border-gray-200">
                            🔒 Esta semana solo está disponible para visualización
                        </div>
                    )}
                </div>

                {/* Meals Grid - More Compact with Borders */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-24">
                    {currentMenu.meals.map((meal) => (
                        <div
                            key={meal.id}
                            onClick={() => toggleMeal(meal.id)}
                            className={`
                                relative bg-white rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group
                                ${selectedMeals.includes(meal.id) ? 'border-[#4A5D23] ring-1 ring-[#4A5D23] shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'}
                                ${!isOrderingEnabled ? 'opacity-70 grayscale-[0.5] cursor-not-allowed pointer-events-none' : ''}
                            `}
                        >
                            {/* Header Tag */}
                            <div className="bg-[#4A5D23] text-white text-center py-1 text-sm font-bold tracking-wide">
                                {meal.day}
                            </div>

                            {/* Image */}
                            <div className="relative h-40 w-full bg-gray-100">
                                <Image
                                    src={meal.image}
                                    alt={meal.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                                />
                                {selectedMeals.includes(meal.id) && (
                                    <div className="absolute inset-0 bg-[#4A5D23]/40 flex items-center justify-center backdrop-blur-[2px] animate-fade-in">
                                        <div className="bg-white text-[#4A5D23] rounded-full p-2 shadow-xl transform scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3 flex flex-col h-full">
                                <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight min-h-[2.5em] group-hover:text-[#4A5D23] transition-colors">{meal.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{meal.description}</p>

                                {isOrderingEnabled ? (
                                    <button
                                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all mt-auto border
                                            ${selectedMeals.includes(meal.id)
                                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                : 'bg-white border-gray-300 text-gray-700 hover:border-[#4A5D23] hover:text-[#4A5D23]'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMeal(meal.id);
                                        }}
                                    >
                                        {selectedMeals.includes(meal.id) ? 'Quitar' : 'Seleccionar'}
                                    </button>
                                ) : (
                                    <span className="block text-center text-xs text-gray-400 mt-auto py-1.5 bg-gray-50 rounded-lg border border-gray-100">No disponible</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Cart (Sticky) */}
                {selectedMeals.length > 0 && isOrderingEnabled && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-50 animate-slide-up">
                        <div className="container mx-auto max-w-4xl">

                            {/* Extras Section (Upselling - Point 6) */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="flex-1 w-full">
                                    <div className="bg-[#4A5D23]/5 p-3 rounded-xl border border-[#4A5D23]/10">
                                        <h4 className="font-bold text-sm text-[#4A5D23] mb-3 flex items-center gap-2">
                                            🥤 ¡Acompaña tu almuerzo con el sabor de casa!
                                        </h4>
                                        <div className="flex gap-3 overflow-x-auto pb-1">
                                            {extras.map(drink => (
                                                <div key={drink.id} className="flex items-center bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm shrink-0">
                                                    <div className="mr-4">
                                                        <p className="text-xs font-bold text-gray-800">{drink.name}</p>
                                                        <p className="text-[10px] text-gray-500">${drink.price.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateExtraQuantity(drink.id, -1)}
                                                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold hover:bg-gray-200 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold w-4 text-center text-sm">{drink.quantity}</span>
                                                        <button
                                                            onClick={() => updateExtraQuantity(drink.id, 1)}
                                                            className="w-7 h-7 rounded-full bg-[#4A5D23] text-white flex items-center justify-center text-sm font-bold hover:bg-[#3a491c] shadow-lg shadow-[#4A5D23]/20 transition-all active:scale-95"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary & Actions */}
                                <div className="flex-1 w-full md:w-auto mt-4 md:mt-0">
                                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-orange-800 font-bold uppercase tracking-wider">Tu Canasta</p>
                                                <p className="text-lg font-bold text-gray-900 leading-none mt-1">
                                                    Total: ${total.toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    {selectedMeals.length} almuerzos + {extras.reduce((a, b) => a + b.quantity, 0)} bebidas
                                                </p>
                                            </div>
                                            <button
                                                className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg text-sm whitespace-nowrap
                                                    ${!payIdProofBase64
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                                        : 'bg-[#4A5D23] text-white hover:bg-[#3a491c] shadow-[#4A5D23]/20'
                                                    }`}
                                                disabled={!payIdProofBase64}
                                                onClick={handleSubscribe}
                                            >
                                                Finalizar Pedido →
                                            </button>
                                        </div>

                                        {/* Payment Method strictly PayID (Label ONLY) */}
                                        <div className="flex gap-2 text-xs">
                                            <div className="flex items-center gap-1 text-[#4A5D23] font-bold">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span>Pago Seguro vía PayID</span>
                                            </div>
                                        </div>
                                        {/* Instructions & Upload Area (Always visible for PayID) */}
                                        <div className="mt-2 p-4 bg-[#FFF8F0] rounded-xl border border-orange-200 text-[11px] space-y-3 shadow-sm">
                                            <div className="bg-orange-100 p-2 rounded-lg font-black text-orange-800 uppercase tracking-tighter text-center">
                                                Pasos para pagar con PayID
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-orange-500 shadow-sm shrink-0">1</span>
                                                    <p>Escoge tipo de pago por <span className="font-bold text-gray-800">"Email"</span>.</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-orange-500 shadow-sm shrink-0">2</span>
                                                    <p>Transfiere el total a: <span className="font-bold text-gray-800">tropicaliahome.au@gmail.com</span></p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-orange-500 shadow-sm shrink-0">3</span>
                                                    <p>Usa tu <span className="font-bold text-gray-800">número de teléfono</span> como referencia del pago.</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-orange-500 shadow-sm shrink-0">4</span>
                                                    <p>Sube una <span className="font-bold text-gray-800">captura de pantalla</span> del comprobante aquí abajo.</p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-orange-100">
                                                <p className="font-bold text-gray-700 mb-2 flex items-center gap-1">
                                                    📸 Adjuntar Comprobante:
                                                </p>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
