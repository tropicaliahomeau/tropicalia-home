
'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './staff.module.css';

// Metadata removed because this is a client component

export default function StaffDashboard() {
    const { user, isLoading, allOrders, updateOrderStatus } = useUser();
    const router = useRouter();

    // No local state for orders anymore

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'staff' && user.role !== 'admin') {
                router.push('/dashboard'); // Redirect non-staff
            }
        }
    }, [user, isLoading, router]);


    const updateStatus = (id: number, newStatus: string) => {
        updateOrderStatus(id, newStatus);
    };


    if (isLoading || !user || (user.role !== 'staff' && user.role !== 'admin')) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-xl text-[var(--primary)]">Loading Staff Portal...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Staff Dashboard</h1>
                    <div className="text-sm text-[var(--text-secondary)]">Daily Orders Management</div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.statValue}>{allOrders.length}</div>
                        <div className="text-[var(--text-secondary)]">Total Orders Today</div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.statValue}>{allOrders.filter(o => o.status === 'Pending').length}</div>
                        <div className="text-[var(--text-secondary)]">Pending Preparation</div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.statValue}>{allOrders.filter(o => o.status === 'Ready').length}</div>
                        <div className="text-[var(--text-secondary)]">Ready for Delivery</div>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Current Orders</h2>
                <div className={styles.orderList}>
                    {allOrders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderInfo}>
                                <span className={styles.customerName}>{order.customer}</span>
                                <span className={styles.orderDetail}>{order.meal}</span>
                                <span className={`text-sm mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'Ready' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className={styles.actions}>
                                {order.status === 'Pending' && (
                                    <button
                                        className={`${styles.btnAction} ${styles.btnReady}`}
                                        onClick={() => updateStatus(order.id, 'Ready')}
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'Ready' && (
                                    <button
                                        className={`${styles.btnAction} ${styles.btnDeliver}`}
                                        onClick={() => updateStatus(order.id, 'Delivered')}
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                                {order.status === 'Delivered' && (
                                    <span className="text-green-600 font-bold px-4">Completed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
