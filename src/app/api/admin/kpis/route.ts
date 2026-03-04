import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '@/data/mockAdminData';

export async function GET(request: NextRequest) {
    // Production Transition: Starting from zero (Point #2)
    return NextResponse.json({
        ordersConfirmed: { value: 0, change: 0 },
        ordersDelivered: { value: 0, change: 0 },
        totalCustomers: { value: 0, change: 0 },
        recurringCustomers: { value: 0, change: 0 },
    });
}
