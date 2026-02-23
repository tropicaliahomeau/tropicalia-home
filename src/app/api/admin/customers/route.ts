import { NextResponse } from 'next/server';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '@/data/mockAdminData';

export async function GET() {
    const customers = MOCK_CUSTOMERS.map(customer => {
        // Calculate customer metrics
        const customerOrders = MOCK_ORDERS.filter(o => o.customer_id === customer.id);
        const weeksOrdered = customerOrders.map(o => o.week_label);
        const uniqueWeeks = Array.from(new Set(weeksOrdered));

        // Sort orders to find last order
        const sortedOrders = customerOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastOrder = sortedOrders[0];

        // Purchase frequency (simplified logic)
        // "Weekly" if ordered in last 2 available weeks, "Occasional" otherwise
        // In a real app we'd check the last 4 weeks dynamically.
        const isRegular = uniqueWeeks.includes('2026-W07') && uniqueWeeks.includes('2026-W06');
        const frequency = isRegular ? 'Weekly' : 'Occasional';

        return {
            ...customer,
            weeks_ordered_count: uniqueWeeks.length,
            last_week_ordered: lastOrder ? lastOrder.week_label : 'N/A',
            purchase_frequency: frequency,
        };
    });

    return NextResponse.json(customers);
}
