
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define User Types
export type UserRole = "ADMIN" | "KITCHEN" | "STAFF" | "CUSTOMER";

export interface Subscription {
    status: 'active' | 'inactive' | 'pending';
    planName: string;
    meals: number[]; // IDs of selected meals
    extras?: { id: string; name: string; price: number; quantity: number }[];
    total?: number;
    paymentMethod?: 'auto' | 'payid';
    payIdProof?: string | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    subscription?: Subscription;
    referralCount?: number;
    allergies?: string;
}

// Define Order Interface
export interface Order {
    id: string;
    customer: string;
    meal: string;
    status: string;
    customerId?: string;
    isNotified?: boolean;
    date?: string;
    total?: number;
    lunchTotal?: number;
    extrasTotal?: number;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, role: UserRole) => void;
    logout: () => void;
    register: (name: string, email: string, phone: string, allergies: string, referrerPhone?: string) => void;
    updateSubscription: (subscription: Subscription) => void;
    allOrders: Order[];
    updateIsNotified: (id: string) => void;
    updateOrderStatus: (id: string, status: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Helper to get referral count
    const getReferralCount = (phone?: string): number => {
        if (!phone) return 0;
        try {
            const referrals = JSON.parse(localStorage.getItem("tropicalia_referrals") || "{}");
            return referrals[phone] || 0;
        } catch (e) {
            return 0;
        }
    };

    // Simulate checking for a logged-in user on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("tropicalia_user");
        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                // Refresh referral count from storage
                parsedUser.referralCount = getReferralCount(parsedUser.phone);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem("tropicalia_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, role: UserRole) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // In a real app we would look up the user. 
            // Here we just mock it, but if we can find a phone stored previously for this email in a "mock db" we would use it.
            // For now, prompt the user if needed or just use a dummy phone if not provided, 
            // but the login signature doesn't take phone.
            // We'll just set referralCount to 0 for this mock login unless we had it.

            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: email.split("@")[0],
                email,
                role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                // Default no subscription
                referralCount: 0
            };

            // If we have the user in local storage already, try to preserve their phone to show referrals
            const existing = localStorage.getItem("tropicalia_user");
            if (existing) {
                const parsed = JSON.parse(existing);
                if (parsed.email === email) {
                    mockUser.phone = parsed.phone;
                    mockUser.referralCount = getReferralCount(parsed.phone);
                }
            }

            setUser(mockUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(mockUser));
            setIsLoading(false);

            // Redirect based on role
            if (role === 'ADMIN') router.push('/admin/dashboard');
            else router.push('/dashboard'); // Client dashboard

        }, 800);
    };

    const register = (name: string, email: string, phone: string, allergies: string, referrerPhone?: string) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Handle Referral Logic
            if (referrerPhone) {
                try {
                    const referrals = JSON.parse(localStorage.getItem("tropicalia_referrals") || "{}");
                    referrals[referrerPhone] = (referrals[referrerPhone] || 0) + 1;
                    localStorage.setItem("tropicalia_referrals", JSON.stringify(referrals));

                    // Check if they reached 5 referrals now (Critical Point #7)
                    if (referrals[referrerPhone] >= 5) {
                        console.log("REWARD UNLOCKED: 5 Referrals reached for", referrerPhone);
                    }
                } catch (e) {
                    console.error("Error saving referral", e);
                }
            }

            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                email,
                phone,
                allergies, // Added allergies
                role: "CUSTOMER", // Default role
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                referralCount: 0 // New users start with 0
            };

            setUser(mockUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(mockUser));

            // Sync with Admin Dashboard (Production Transition - Point #2)
            try {
                const allUsersJson = localStorage.getItem("tropicalia_all_users") || "[]";
                const allUsers = JSON.parse(allUsersJson);
                // Avoid duplicates by email
                const existingIndex = allUsers.findIndex((u: any) => u.email === email);
                if (existingIndex > -1) {
                    allUsers[existingIndex] = mockUser;
                } else {
                    allUsers.push(mockUser);
                }
                localStorage.setItem("tropicalia_all_users", JSON.stringify(allUsers));
            } catch (e) { }

            setIsLoading(false);
            router.push('/dashboard');
        }, 1000);
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem("tropicalia_user");
        router.push("/");
    };

    const [allOrders, setAllOrders] = useState<Order[]>([
        { id: "TH-1001", customer: "João Silva", meal: "Feijoada Completa", status: "Pending", customerId: "client1", date: "2026-03-01" },
        { id: "TH-1002", customer: "Maria Souza", meal: "Grilled Chicken Salad", status: "Ready", customerId: "client2", date: "2026-03-02" },
        { id: "TH-1003", customer: "Pedro Santos", meal: "Fish Tacos", status: "Pending", customerId: "client3", date: "2026-03-03" },
    ]);

    const updateOrderStatus = (id: string, status: string) => {
        setAllOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status } : order
        ));
    };

    const updateIsNotified = (id: string) => {
        setAllOrders(prev => prev.map(order =>
            order.id === id ? { ...order, isNotified: true } : order
        ));
    };

    const updateSubscription = (subscription: Subscription) => {
        if (!user) return;

        let finalSubscription = { ...subscription };

        // Apply Referral Reward (Critical Point #7)
        if (user.referralCount && user.referralCount >= 5) {
            console.log("APPLYING FREE WEEK REWARD!");
            finalSubscription.total = 0;
            finalSubscription.planName = `🎁 SEMANA GRATIS! (${subscription.planName})`;

            // Reset counter in storage
            const updatedUser = { ...user, referralCount: 0, subscription: finalSubscription };
            try {
                const referrals = JSON.parse(localStorage.getItem("tropicalia_referrals") || "{}");
                if (user.phone) {
                    referrals[user.phone] = 0;
                    localStorage.setItem("tropicalia_referrals", JSON.stringify(referrals));
                }
            } catch (e) { }

            setUser(updatedUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(updatedUser));
            alert("✅ ¡FELICIDADES! Has desbloqueado tu SEMANA GRATIS por traer a 5 amigos. Este pedido tiene un 100% de descuento.");
        } else {
            const updatedUser = { ...user, subscription: finalSubscription };
            setUser(updatedUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(updatedUser));
        }

        // Generate Unique Order ID (Point #4 Additional)
        const orderId = `TH-${Math.floor(1000 + Math.random() * 9000)}`;

        // Calculate granular totals
        const lunchTotal = subscription.planName.toLowerCase().includes('semana') ? subscription.total || 0 : (subscription.total || 0);
        // Note: For now, if no explicit breakdown, we'll try to estimate or just store total.
        // Better: using the actual extras list if available.
        const extrasTotal = subscription.extras?.reduce((sum, e) => sum + (e.price * e.quantity), 0) || 0;
        const mainLunchTotal = (subscription.total || 0) - extrasTotal;

        // Mock creating a new order
        const newOrder: Order = {
            id: orderId,
            customer: user.name,
            meal: subscription.planName,
            status: "Pending",
            customerId: user.id,
            date: new Date().toISOString().split('T')[0],
            total: subscription.total,
            lunchTotal: mainLunchTotal,
            extrasTotal: extrasTotal
        };

        // Update User History/Context
        const finalSubscriptionWithId = { ...finalSubscription, orderId };
        const updatedUserFinal = { ...user, subscription: finalSubscriptionWithId };
        setUser(updatedUserFinal);
        localStorage.setItem("tropicalia_user", JSON.stringify(updatedUserFinal));

        setAllOrders(prev => {
            const updated = [...prev, newOrder];
            localStorage.setItem("tropicalia_orders", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <UserContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            register,
            updateSubscription,
            allOrders,
            updateIsNotified,
            updateOrderStatus
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
