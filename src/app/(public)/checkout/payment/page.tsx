'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MENUS } from '@/data/menus';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export default function PaymentPage() {
    const {
        cart,
        user,
        updateSubscription,
        clearCart
    } = useUser();
    const router = useRouter();

    const [payIdProof, setPayIdProof] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

    const currentMenu = MENUS[0];
    const selectedMealObjects = currentMenu.meals.filter(m => cart.meals.includes(m.id));

    const calculateTotal = () => {
        const isFullWeek = cart.meals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : (cart.meals.length * 18.00);
        const extrasCost = cart.extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return daysCost + extrasCost;
    };

    const total = calculateTotal();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPayIdProof(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPayIdProof(null);
        }
    };

    const handleFinalize = async () => {
        if (!user) {
            alert("Por favor, inicia sesión para finalizar tu pedido.");
            router.push('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const isFullWeek = cart.meals.length >= 5;
            const planName = isFullWeek ? "Semana Completa" : `${cart.meals.length} Almuerzos`;

            await updateSubscription({
                status: 'Pending Validation',
                planName: planName,
                meals: cart.meals,
                extras: cart.extras,
                total: total,
                paymentMethod: 'payid',
                payIdProof: payIdProof
            });

            setIsSuccess(true);
            setTimeout(() => {
                clearCart();
                router.push('/dashboard');
            }, 3000);
        } catch (error) {
            alert("Error al procesar el pedido. Por favor intenta de nuevo.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-4xl font-black text-gray-800 mb-4">¡Pedido Recibido!</h1>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Tu comprobante ha sido enviado. Ish validará tu pago pronto. Redirigiendo a tu Dashboard...
                </p>
                <div className="w-12 h-12 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

    if (cart.meals.length === 0 && cart.extras.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Acceso denegado</h1>
                <p className="text-gray-600 mb-8">Debes seleccionar productos antes de proceder al pago.</p>
                <Link href="/menu" className="bg-[#4A5D23] text-white px-10 py-4 rounded-full font-bold no-underline inline-block">Ir al Menú</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex justify-between items-center mb-10">
                <Link href="/checkout/review" className="text-[#4A5D23] font-bold flex items-center gap-2 hover:underline no-underline">
                    ← Volver al Resumen
                </Link>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Paso 3 de 3: Pago Final
                </div>
            </div>

            <div className="flex flex-col items-center animate-fade-in gap-10">
                <h1 className="text-4xl font-black text-gray-800 text-center mb-6">Confirmación de Pedido 🥣</h1>

                {/* MAIN CARD CONTAINER */}
                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-200/50 flex flex-col gap-8">

                    {/* 1. Order Details & Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="font-black text-gray-800 uppercase tracking-tight">Tu Selección</span>
                            <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-3">
                            {selectedMealObjects.map(meal => (
                                <div key={meal.id} className="flex gap-4 items-center">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                        <Image src={meal.image} alt={meal.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-800 text-sm leading-tight">{meal.day} - {meal.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>

                        {/* 2. Upload Payment Proof */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 text-center">
                                <p className="text-sm font-black text-[#4A5D23] uppercase tracking-widest mb-6">📸 ADJUNTAR COMPROBANTE</p>
                                <label className={`
                                    flex flex-col items-center justify-center gap-4 p-10 border-4 border-dashed rounded-3xl cursor-pointer transition-all min-h-[200px]
                                    ${payIdProof ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-[#4A5D23] hover:bg-green-50/30'}
                                `}>

                                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                    {payIdProof ? (
                                        <>
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-black text-green-700 uppercase tracking-tight">Comprobante Listo</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-tight">Subir Captura</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>



                        {/* Finalize Button */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={handleFinalize}
                                disabled={!payIdProof || isProcessing}
                                className={`
                                    w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                                    ${(!payIdProof || isProcessing)
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-[#4A5D23] text-white hover:bg-[#3a491c] hover:scale-[1.02] shadow-[#4A5D23]/30'}
                                `}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </div>
                                ) : 'Finalizar Pedido'}
                            </button>

                            {!payIdProof && (
                                <p className="text-center text-[10px] text-red-400 mt-4 font-black uppercase tracking-widest animate-pulse">
                                    Se requiere soporte de pago
                                </p>
                            )}
                        </div>
                    </div>
            </div>
        </div>
    );
}
