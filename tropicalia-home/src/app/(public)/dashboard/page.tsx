'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
    const { user, isLoading, allOrders } = useUser();
    const router = useRouter();

    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [nextDelivery, setNextDelivery] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && user && user.role !== 'ADMIN' && (!user.phone || !user.allergies)) {
            router.push('/register');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        async function fetchOrders() {
            if (user?.email) {
                const { supabase } = await import('@/lib/supabaseClient');
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('email_cliente', user.email)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setMyOrders(data);
                    const pagado = data.filter(o => o.estado === 'pagado');
                    if (pagado.length > 0) {
                        setNextDelivery(pagado[0]);
                    }
                }
            }
        }
        fetchOrders();
    }, [user?.email]);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-xl text-[var(--primary)]">Loading your tropical dashboard...</div>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Helper for status badge class
    const getStatusClass = (status: string) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('pending') || s.includes('pendiente')) return styles.statusPending;
        if (s.includes('ready') || s.includes('preparando')) return styles.statusReady;
        if (s.includes('delivered') || s.includes('entregado')) return styles.statusDelivered;
        return styles.statusPending;
    };

    // Referral Logic
    const referrals = user.referralCount || 0;
    const referralsNeeded = 5;
    const progress = Math.min((referrals / referralsNeeded) * 100, 100);
    const isFreeWeekUnlocked = referrals >= referralsNeeded;

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Hola, {user.name} 👋</h1>
                    <p className="text-gray-500">{today}</p>
                </div>
                <Link href="/menu" className="bg-[#4A5D23] text-white px-6 py-2 rounded-lg hover:bg-[#3a491c] transition-colors font-bold shadow-lg shadow-[#4A5D23]/20">
                    {user.subscription ? 'Gestionar Suscripción' : 'Explorar Menú'}
                </Link>
            </header>

            {/* Referral Banner */}
            <div className="bg-gradient-to-r from-[#4A5D23] to-[#8BC34A] rounded-2xl p-6 text-white shadow-xl mb-10 relative overflow-hidden transform hover:scale-[1.01] transition-transform">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-inner">
                        <span className="text-4xl">🎁</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold mb-1">
                            {isFreeWeekUnlocked
                                ? "Congratulations! You have unlocked your free week 🎉"
                                : "Win a FREE Week of Lunches!"}
                        </h3>
                        <p className="text-green-50 text-sm mb-3 font-medium">
                            {isFreeWeekUnlocked
                                ? "Your reward will be applied automatically on your next renewal."
                                : `Refer ${referralsNeeded} friends and enjoy 5 days of lunch on us.`}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-xs font-bold text-white mb-1">
                                <span>Progress</span>
                                <span>{referrals}/{referralsNeeded} friends</span>
                            </div>
                            <div className="bg-black/20 h-4 rounded-full overflow-hidden relative border border-white/10">
                                <div
                                    className="h-full bg-yellow-400 transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-xs text-green-100 mt-1 italic">
                                {isFreeWeekUnlocked ? "Goal reached!" : `You need just ${referralsNeeded - referrals} referrals!`}
                            </p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 shadow-lg">
                            <p className="text-xs uppercase tracking-wider text-green-100 mb-1 font-bold">YOUR CODE</p>
                            <p className="text-2xl font-mono font-bold tracking-widest text-white text-shadow">{user.phone || "..."}</p>
                            {!user.phone && <p className="text-[10px] text-yellow-200 mt-1 p-1 bg-black/20 rounded">Add your phone in profile</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Next Delivery Card */}
                <div className={`${styles.card} lg:col-span-5 border-t-4 border-[#D4A373]`}>
                    <h2 className={styles.cardTitle}>
                        <span className="text-2xl">🚚</span> Next Delivery
                    </h2>
                    {nextDelivery ? (
                        <div className={styles.deliveryInfo}>
                            <div className="text-[#4A5D23] font-bold text-sm mb-2">📍 Pick-up Point:</div>
                            <div className="text-gray-700 text-xs mb-3 space-y-1">
                                <p>Tropicalia Latin Food</p>
                                <p>201 Ballarat Rd, Footscray</p>
                                <p className="italic">(La Esquina Latina)</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg mb-4">
                                <p className="text-orange-800 text-xs font-bold">⏰ Hours:</p>
                                <p className="text-orange-900 text-sm font-bold">Sunday from 4:00 PM to 9:00 PM</p>
                            </div>
                            <div className={styles.deliveryDetail}>
                                <p className="font-bold text-gray-800">Confirmed Order</p>
                                <p className="text-sm mt-1 text-[#4A5D23] font-bold">
                                    Pedido #{nextDelivery.id}
                                </p>
                            </div>
                            <div className={styles.deliveryStatus}>
                                <span>🕒</span> Preparing your lunch...
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="text-5xl mb-4 opacity-20">🍽️</div>
                            <p className="text-gray-600 font-medium mb-2">You haven't confirmed your weekly order yet.</p>
                            <p className="text-gray-500 text-sm italic mb-6">Order before Friday to start preparing your lunches.</p>
                            <Link href="/menu" className="bg-[#4A5D23] text-white px-6 py-2 rounded-lg hover:bg-[#3a491c] transition-colors font-bold shadow-lg shadow-[#4A5D23]/20">
                                Select my Menu
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Orders Card */}
                <div className={`${styles.card} lg:col-span-7 border-t-4 border-[#4A5D23]`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={styles.cardTitle}>
                            <span className="text-2xl">📜</span> Order History
                        </h2>
                        {myOrders.length > 0 && (
                            <button className="text-xs font-bold text-[#4A5D23] uppercase tracking-wider hover:underline">
                                View all
                            </button>
                        )}
                    </div>

                    {myOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-5xl mb-4 opacity-20">📜</div>
                            <p className="text-gray-400 font-medium italic">No order history yet.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {myOrders.map(order => (
                                <li key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                        <span className={styles.orderMenu}>${order.total} - Order #{order.id}</span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${getStatusClass(order.estado)}`}>
                                        {order.estado}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
