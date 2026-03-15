"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define User Types
export type UserRole = "ADMIN" | "KITCHEN" | "STAFF" | "CUSTOMER";

export interface Subscription {
    status: 'active' | 'inactive' | 'pending' | 'Pending Validation' | 'Confirmed';
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
    phone?: string;
    isNotified?: boolean;
    date?: string;
    total?: number;
    lunchTotal?: number;
    extrasTotal?: number;
    payIdProof?: string | null;
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
    cart: {
        meals: number[];
        extras: { id: string; name: string; price: number; quantity: number }[];
    };
    addToCart: (type: 'meal' | 'extra', item: any) => void;
    removeFromCart: (type: 'meal' | 'extra', id: string | number) => void;
    updateCartExtraQuantity: (id: string, change: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
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
                parsedUser.referralCount = getReferralCount(parsedUser.phone);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem("tropicalia_user");
            }
        }

        // Load existing orders
        const storedOrders = localStorage.getItem("tropicalia_orders");
        if (storedOrders) {
            try {
                const parsedOrders: Order[] = JSON.parse(storedOrders);
                setAllOrders(parsedOrders);
            } catch (e) {
                console.error("Failed to parse orders data", e);
            }
        }

        setIsLoading(false);
    }, []);

    const login = (email: string, role: UserRole) => {
        setIsLoading(true);
        setTimeout(() => {
            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: email.split("@")[0],
                email,
                role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                referralCount: 0
            };

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

            if (role === 'ADMIN') router.push('/admin/dashboard');
            else router.push('/dashboard');
        }, 800);
    };

    const register = (name: string, email: string, phone: string, allergies: string, referrerPhone?: string) => {
        setIsLoading(true);
        setTimeout(() => {
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
                allergies,
                role: "CUSTOMER",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                referralCount: 0
            };

            setUser(mockUser);
            localStorage.setItem("tropicalia_user", JSON.stringify(mockUser));

            try {
                const allUsersJson = localStorage.getItem("tropicalia_all_users") || "[]";
                const allUsers = JSON.parse(allUsersJson);
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

    const [allOrders, setAllOrders] = useState<Order[]>([]);

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

        if (user.referralCount && user.referralCount >= 5) {
            finalSubscription.total = 0;
            finalSubscription.planName = `🎁 SEMANA GRATIS! (${subscription.planName})`;

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

        const orderId = `TH-${Math.floor(1000 + Math.random() * 9000)}`;
        const extrasTotal = subscription.extras?.reduce((sum, e) => sum + (e.price * e.quantity), 0) || 0;
        const mainLunchTotal = (subscription.total || 0) - extrasTotal;

        const newOrder: Order = {
            id: orderId,
            customer: user.name,
            phone: user.phone || 'N/A',
            meal: subscription.planName,
            status: "Pending",
            customerId: user.id,
            date: new Date().toISOString().split('T')[0],
            total: subscription.total,
            lunchTotal: mainLunchTotal,
            extrasTotal: extrasTotal,
            payIdProof: subscription.payIdProof
        };

        try {
            const finalSubscriptionWithId = { ...finalSubscription, orderId };
            const updatedUserFinal = { ...user, subscription: finalSubscriptionWithId };
            setUser(updatedUserFinal);
            localStorage.setItem("tropicalia_user", JSON.stringify(updatedUserFinal));

            setAllOrders(prev => {
                const updated = [...prev, newOrder];
                try {
                    localStorage.setItem("tropicalia_orders", JSON.stringify(updated));
                } catch (e) {
                    console.error("Storage limit exceeded for orders:", e);
                }
                return updated;
            });
        } catch (e) {
            console.error("Critical Storage Error:", e);
            alert("⚠️ Error de Almacenamiento: El comprobante es demasiado pesado o el historial está lleno. Por favor, intenta con una imagen más pequeña o limpia el caché del navegador.");
        }
    };

    // Cart State
    const [cart, setCart] = useState<{
        meals: number[];
        extras: { id: string; name: string; price: number; quantity: number }[];
    }>({
        meals: [],
        extras: []
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (type: 'meal' | 'extra', item: any) => {
        if (type === 'meal') {
            setCart(prev => ({
                ...prev,
                meals: prev.meals.includes(item.id) ? prev.meals : [...prev.meals, item.id]
            }));
        } else {
            setCart(prev => {
                const existing = prev.extras.find(e => e.id === item.id);
                if (existing) {
                    return {
                        ...prev,
                        extras: prev.extras.map(e => e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e)
                    };
                }
                return {
                    ...prev,
                    extras: [...prev.extras, { ...item, quantity: 1 }]
                };
            });
        }
    };

    const removeFromCart = (type: 'meal' | 'extra', id: string | number) => {
        if (type === 'meal') {
            setCart(prev => ({
                ...prev,
                meals: prev.meals.filter(mId => mId !== id)
            }));
        } else {
            setCart(prev => ({
                ...prev,
                extras: prev.extras.filter(e => e.id !== id)
            }));
        }
    };

    const updateCartExtraQuantity = (id: string, change: number) => {
        setCart(prev => ({
            ...prev,
            extras: prev.extras.map(e => {
                if (e.id === id) {
                    const newQty = Math.max(0, e.quantity + change);
                    return { ...e, quantity: newQty };
                }
                return e;
            }).filter(e => e.quantity > 0)
        }));
    };

    const clearCart = () => {
        setCart({ meals: [], extras: [] });
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
            updateOrderStatus,
            cart,
            addToCart,
            removeFromCart,
            updateCartExtraQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen
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
