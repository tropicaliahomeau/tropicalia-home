'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import { supabase } from '@/lib/supabaseClient';

export default function PaymentPage() {
    const {
        cart,
        clearCart
    } = useUser();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Please sign in to complete your order");
                router.push("/login");
            } else {
                setIsAuthenticated(true);
            }
        };
        checkAuth();
    }, [router]);

    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const selectedMealObjects = cart.meals;

    const calculateTotal = () => {
        const isFullWeek = cart.meals.length >= 5;
        const daysCost = isFullWeek ? 85.00 : (cart.meals.length * 18.00);
        const extrasCost = cart.extras.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        return daysCost + extrasCost;
    };

    const total = calculateTotal();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
    };

    const isCustomerDataValid = () => {
        return customerData.name.trim() !== '' && 
               customerData.phone.trim() !== '' && 
               customerData.email.trim() !== '' && 
               customerData.email.includes('@');
    };

    const handlePayment = async (token: string) => {
        if (!isCustomerDataValid()) {
            alert('Please, fill in all your personal details correctly.');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceId: token,
                    amount: total,
                    customer: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                    cart: cart
                })
            });

            const data = await response.json();

            if (data.success) {
                setOrderNumber(data.orderId);
                clearCart();
                setIsSuccess(true);
            } else {
                alert('Error processing payment: ' + data.error);
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            alert("Connection error processing payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-4xl font-black text-gray-800 mb-4">Order Confirmed!</h1>
                <p className="text-gray-600 text-lg mb-2 max-w-md mx-auto">
                    Your payment has been processed successfully. Yummy!
                </p>
                {orderNumber && (
                    <p className="text-gray-800 font-bold text-xl mb-8">
                        Order #{orderNumber}
                    </p>
                )}
                {/* 5. Confirmation Screen Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto mb-8 border border-gray-100 text-left">
                    <p className="font-bold text-gray-800 mb-2">Order summary:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                        {selectedMealObjects.map((meal: any) => (
                            <li key={meal.id}>• {meal.title}</li>
                        ))}
                        {cart.extras.map((extra: any) => (
                            <li key={extra.id}>• {extra.name} (x{extra.quantity})</li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={() => {
                        clearCart();
                        router.push('/menu');
                    }}
                    className="bg-[#4A5D23] text-white px-10 py-4 rounded-full font-bold no-underline inline-block hover:bg-[#3a491c] transition-colors"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    if (cart.meals.length === 0 && cart.extras.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
                <p className="text-gray-600 mb-8">You must select products before proceeding to payment.</p>
                <Link href="/menu" className="bg-[#4A5D23] text-white px-10 py-4 rounded-full font-bold no-underline inline-block">Go to Menu</Link>
            </div>
        );
    }

    if (isAuthenticated === null) return <div className="py-20 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex justify-between items-center mb-10">
                <Link href="/checkout/review" className="text-[#4A5D23] font-bold flex items-center gap-2 hover:underline no-underline">
                    ← Back to Review
                </Link>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Step 3 of 3: Final Payment
                </div>
            </div>

            <div className="flex flex-col items-center animate-fade-in gap-10">
                <h1 className="text-4xl font-black text-gray-800 text-center mb-6">Order Confirmation 🥣</h1>

                {/* MAIN CARD CONTAINER */}
                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-200/50 flex flex-col gap-8">

                    {/* 1. Order Details & Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <span className="font-black text-gray-800 uppercase tracking-tight">Your Selection</span>
                            <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-3">
                            {selectedMealObjects.map((meal: any) => (
                                <div key={meal.id} className="flex gap-4 items-center">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                        <Image src={meal.image || '/placeholder-meal.jpg'} alt={meal.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-800 text-sm leading-tight">{meal.day} - {meal.title}</p>
                                    </div>
                                </div>
                            ))}
                            {cart.extras.map((extra: any) => (
                                <div key={extra.id} className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center text-xl shrink-0 shadow-sm">
                                        🍹
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-800 text-sm leading-tight">{extra.quantity}x {extra.name}</p>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">${(extra.price * extra.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Customer Details */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <h2 className="font-black text-gray-800 uppercase tracking-tight">Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name *</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={customerData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., John Doe" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4A5D23] transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone *</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={customerData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g., +61 400 000 000" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4A5D23] transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={customerData.email}
                                    onChange={handleInputChange}
                                    placeholder="e.g., john@example.com" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4A5D23] transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Payment Block */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <h2 className="font-black text-gray-800 uppercase tracking-tight mb-2">Secure Payment</h2>
                        
                        {isProcessing ? (
                            <div className="py-10 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-8 h-8 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600 font-bold">Processing your payment...</p>
                            </div>
                        ) : (
                            <div className={`transition-opacity ${!isCustomerDataValid() ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                {!isCustomerDataValid() && (
                                    <p className="text-xs text-orange-500 mb-4 font-bold">⚠️ Complete your details above to enable the ${total.toFixed(2)} payment</p>
                                )}
                                
                                {process.env.NEXT_PUBLIC_SQUARE_APP_ID && process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ? (
                                    <PaymentForm
                                        applicationId={process.env.NEXT_PUBLIC_SQUARE_APP_ID}
                                        locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID}
                                        cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
                                            if (token.status === 'OK') {
                                                await handlePayment(token.token);
                                            } else {
                                                console.error('Square Tokenization Error:', (token as any).errors || token);
                                                alert("Error validating card. Check details.");
                                            }
                                        }}
                                    >
                                        <CreditCard
                                            buttonProps={{
                                                css: {
                                                    backgroundColor: '#4A5D23',
                                                    fontSize: '16px',
                                                    color: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#3a491c',
                                                    },
                                                },
                                            }}
                                            style={{
                                                input: {
                                                    fontSize: '16px',
                                                    color: '#374151',
                                                },
                                            }}
                                        >
                                            Pay ${total.toFixed(2)}
                                        </CreditCard>
                                    </PaymentForm>
                                ) : (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                                        Error: Payment credentials not configured.
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Payments securely processed by Square</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
