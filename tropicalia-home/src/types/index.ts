// Domain Types for Tropicalia HOME V2

export type UserRole = 'admin' | 'kitchen' | 'staff' | 'customer';

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
    phone?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface MenuItem {
    id: number;
    day: DayOfWeek;
    name: string;
    description: string;
    allergens?: string[];
    image_url?: string;
}

export interface Extra {
    id: number;
    name: string;
    price: number;
}

export type OrderStatus = 'pending' | 'approved' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered';

export interface Order {
    id: number;
    user_id: number;
    customer_name: string; // Joined for convenience
    user_role?: UserRole; // To check access
    status: OrderStatus;
    total_amount: number;
    items: MenuItem[]; // Simplified linkage
    extras: { name: string; quantity: number }[];
    delivery_method: 'pickup' | 'delivery';
    payment_method: 'auto' | 'payid';
    payment_proof_url?: string;
    notes?: string;
    created_at: string;
}
