import { NextResponse } from 'next/server';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '@/data/mockAdminData';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const weekLabel = searchParams.get('week_label');
    const status = searchParams.get('status');
    const deliveryType = searchParams.get('delivery_type');

    let filteredOrders = MOCK_ORDERS;

    if (weekLabel) {
        filteredOrders = filteredOrders.filter(o => o.week_label === weekLabel);
    }

    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    if (deliveryType) {
        filteredOrders = filteredOrders.filter(o => o.delivery_type === deliveryType);
    }

    // Enrich orders with customer names
    const enrichedOrders = filteredOrders.map(order => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === order.customer_id);
        return {
            ...order,
            customer_name: customer ? customer.full_name : 'Unknown',
        };
    });

    return NextResponse.json(enrichedOrders);
}
