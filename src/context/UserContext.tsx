
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define User Types
export type UserRole = "ADMIN" | "CLIENT";

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
}

// Define Order Interface
export interface Order {
    id: number;
    customer: string;
    meal: string;
    status: string;
    customerId?: string; // Link to user ID
    isNotified?: boolean;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, role: UserRole) => void;
    logout: () => void;
    register: (name: string, email: string, phone: string, referrerPhone?: string) => void;
    updateSubscription: (subscription: Subscription) => void;
    allOrders: Order[];
    updateIsNotified: (id: number) => void;
    updateOrderStatus: (id: number, status: string) => void;
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

    const register = (name: string, email: string, phone: string, referrerPhone?: string) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Handle Referral Logic
            if (referrerPhone) {
                try {
                    const referrals = JSON.parse(localStorage.getItem("tropicalia_referrals") || "{}");
                    referrals[referrerPhone] = (referrals[referrerPhone] || 0) + 1;
                    localStorage.setItem("tropicalia_referrals", JSON.stringify(referrals));
                } catch (e) {
                    console.error("Error saving referral", e);
                }
            }

            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                email,
                phone,
                role: "CLIENT", // Default role
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                referralCount: 0 // New users start with 0
            };

            setUser(mockUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(mockUser));
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
        { id: 1, customer: "João Silva", meal: "Feijoada Completa", status: "Pending", customerId: "client1" },
        { id: 2, customer: "Maria Souza", meal: "Grilled Chicken Salad", status: "Ready", customerId: "client2" },
        { id: 3, customer: "Pedro Santos", meal: "Fish Tacos", status: "Pending", customerId: "client3" },
    ]);

    const updateOrderStatus = (id: number, status: string) => {
        setAllOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status } : order
        ));
    };

    const updateIsNotified = (id: number) => {
        setAllOrders(prev => prev.map(order =>
            order.id === id ? { ...order, isNotified: true } : order
        ));
    };

    const updateSubscription = (subscription: Subscription) => {
        if (!user) return;
        const updatedUser = { ...user, subscription };
        setUser(updatedUser);
        localStorage.setItem("tropicalia_user", JSON.stringify(updatedUser));

        // Mock creating a new order based on subscription
        const newOrder: Order = {
            id: allOrders.length + 1,
            customer: user.name,
            meal: "Chef's Special (Subscription)",
            status: "Pending",
            customerId: user.id
        };
        setAllOrders(prev => [...prev, newOrder]);
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
