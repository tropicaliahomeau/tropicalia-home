'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ReviewPage() {
    const {
        cart,
        removeFromCart,
        updateCartExtraQuantity
    } = useUser();

    const selectedMealObjects = cart.meals;

    const calculateTotal = () => {
        const isFullWeek = cart.meals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : (cart.meals.length * 18.00);
        const extrasCost = cart.extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        return {
            total: daysCost + extrasCost,
            isFullWeek
        };
    };

    const { total, isFullWeek } = calculateTotal();

    if (cart.meals.length === 0 && cart.extras.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Your cart is empty 🛒</h1>
                <p className="text-gray-600 mb-8 text-lg">It seems you haven't selected anything yet.</p>
                <Link href="/menu" className="bg-[#4A5D23] text-white px-10 py-4 rounded-full font-bold no-underline inline-block">
                    Go to Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link href="/menu" className="text-[#4A5D23] font-bold flex items-center gap-2 mb-8 hover:underline no-underline">
                ← Back to Menu
            </Link>

            <h1 className="text-4xl font-black text-gray-800 mb-2">Review your Order 📋</h1>
            <p className="text-gray-600 mb-10 text-lg">Step 2 of 3: Verify your meals and drinks.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    {/* MEALS SECTION */}
                    {selectedMealObjects.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-[#4A5D23] p-4 text-white font-bold">Selected Meals</div>
                            <div className="p-6 space-y-4">
                                {selectedMealObjects.map(meal => (
                                    <div key={meal.id} className="flex justify-between items-center border-b pb-4 border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex gap-4 items-center">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                                <Image src={meal.image} alt={meal.title} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{meal.day}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{meal.title}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart('meal', meal.id)}
                                            className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {isFullWeek && (
                                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-center font-bold text-sm">
                                        Full Week Promo Applied! 🎉 ($85.00)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* EXTRAS SECTION */}
                    {cart.extras.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                            <div className="bg-[#4A5D23] p-4 text-white font-bold">Selected Drinks and Extras</div>
                            <div className="p-6 space-y-4">
                                {cart.extras.map(extra => (
                                    <div key={extra.id} className="flex justify-between items-center border-b pb-4 border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center text-2xl font-black shrink-0">
                                                🍹
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{extra.name}</p>
                                                <p className="text-sm text-gray-500">${extra.price.toFixed(2)} ea x {extra.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                                <button onClick={() => updateCartExtraQuantity(extra.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:bg-gray-100">-</button>
                                                <span className="w-4 text-center text-sm font-bold text-gray-800">{extra.quantity}</span>
                                                <button onClick={() => updateCartExtraQuantity(extra.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:bg-gray-100">+</button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart('extra', extra.id)}
                                                className="text-red-500 text-xs font-bold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* SUMMARY CARD */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border-2 border-[#4A5D23] p-8 shadow-xl sticky top-24">
                        <h3 className="text-xl font-black mb-6 text-gray-800 border-b pb-4">Order Total</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Meals ({cart.meals.length})</span>
                                <span className="font-bold text-gray-800">${isFullWeek ? '85.00' : (cart.meals.length * 18.00).toFixed(2)}</span>
                            </div>

                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="font-black text-gray-800 uppercase">Total</span>
                                <span className="text-3xl font-black text-[#4A5D23]">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout/payment"
                            className="bg-[#4A5D23] text-white w-full py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#4A5D23]/20 flex items-center justify-center gap-2 no-underline hover:scale-[1.02] transition-transform"
                        >
                            Proceed to Payment →
                        </Link>

                        <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold tracking-widest">
                            Secure Payment Protected
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
