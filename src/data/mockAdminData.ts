export type UserRole = 'ADMIN' | 'KITCHEN' | 'STAFF' | 'CUSTOMER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface Customer {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    delivery_distance_km: number;
    created_at: string;
}

export type OrderStatus = 'CONFIRMED' | 'DELIVERED' | 'NOT_PICKED_UP';
export type DeliveryType = 'PICKUP' | 'DELIVERY';

export interface WeeklyOrder {
    id: string;
    customer_id: string;
    week_label: string; // e.g., "2026-W07"
    week_start_date: string;
    status: OrderStatus;
    delivery_type: DeliveryType;
    total_amount: number;
    created_at: string;
}

export interface WeeklyFinance {
    id: string;
    week_label: string;
    revenue_total: number;
    costs_total: number;
    created_at: string;
}

// --- MOCK DATA ---

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin User', email: 'tropicaliahome.au@gmail.com', role: 'ADMIN', created_at: '2026-01-01T00:00:00Z' },
    { id: 'u2', name: 'Client One', email: 'client1@test.com', role: 'CUSTOMER', created_at: '2026-01-10T00:00:00Z' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'c1', full_name: 'Ana García', phone: '555-0101', email: 'ana@example.com', address: 'Calle 123', delivery_distance_km: 2.5, created_at: '2026-01-15T10:00:00Z' },
    { id: 'c2', full_name: 'Carlos López', phone: '555-0102', email: 'carlos@example.com', address: 'Av. Principal 45', delivery_distance_km: 5.0, created_at: '2026-01-20T11:00:00Z' },
    { id: 'c3', full_name: 'Beatriz Silva', phone: '555-0103', email: 'bia@example.com', address: 'Rua das Flores', delivery_distance_km: 1.2, created_at: '2026-02-01T09:30:00Z' },
    { id: 'c4', full_name: 'Daniel Rocha', phone: '555-0104', email: 'daniel@example.com', address: 'Centro', delivery_distance_km: 0.5, created_at: '2026-02-05T14:20:00Z' },
    { id: 'c5', full_name: 'Elena Torres', phone: '555-0105', email: 'elena@example.com', address: 'Zona Norte', delivery_distance_km: 8.0, created_at: '2026-02-10T16:45:00Z' },
];

export const MOCK_ORDERS: WeeklyOrder[] = [
    // Last Week (W06)
    { id: 'o1', customer_id: 'c1', week_label: '2026-W06', week_start_date: '2026-02-02', status: 'DELIVERED', delivery_type: 'DELIVERY', total_amount: 50, created_at: '2026-02-01T10:00:00Z' },
    { id: 'o2', customer_id: 'c2', week_label: '2026-W06', week_start_date: '2026-02-02', status: 'DELIVERED', delivery_type: 'PICKUP', total_amount: 45, created_at: '2026-02-01T11:00:00Z' },
    { id: 'o3', customer_id: 'c3', week_label: '2026-W06', week_start_date: '2026-02-02', status: 'NOT_PICKED_UP', delivery_type: 'PICKUP', total_amount: 45, created_at: '2026-02-01T12:00:00Z' },

    // Current Week (W07)
    { id: 'o4', customer_id: 'c1', week_label: '2026-W07', week_start_date: '2026-02-09', status: 'CONFIRMED', delivery_type: 'DELIVERY', total_amount: 50, created_at: '2026-02-08T09:00:00Z' }, // Recurring
    { id: 'o5', customer_id: 'c2', week_label: '2026-W07', week_start_date: '2026-02-09', status: 'CONFIRMED', delivery_type: 'PICKUP', total_amount: 45, created_at: '2026-02-08T10:00:00Z' }, // Recurring
    { id: 'o6', customer_id: 'c4', week_label: '2026-W07', week_start_date: '2026-02-09', status: 'CONFIRMED', delivery_type: 'DELIVERY', total_amount: 55, created_at: '2026-02-08T14:00:00Z' }, // New this week
    { id: 'o7', customer_id: 'c5', week_label: '2026-W07', week_start_date: '2026-02-09', status: 'CONFIRMED', delivery_type: 'PICKUP', total_amount: 45, created_at: '2026-02-09T08:00:00Z' }, // New this week
];

export const MOCK_FINANCE: WeeklyFinance[] = [
    { id: 'f1', week_label: '2026-W05', revenue_total: 400, costs_total: 200, created_at: '2026-01-30T10:00:00Z' },
    { id: 'f2', week_label: '2026-W06', revenue_total: 450, costs_total: 220, created_at: '2026-02-06T10:00:00Z' },
    { id: 'f3', week_label: '2026-W07', revenue_total: 520, costs_total: 250, created_at: '2026-02-13T10:00:00Z' }, // Current partial
];
