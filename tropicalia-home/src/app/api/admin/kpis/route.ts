import { NextResponse } from 'next/server';
import { MOCK_ORDERS, MOCK_CUSTOMERS, WeeklyOrder } from '@/data/mockAdminData';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const currentWeek = searchParams.get('week_label') || '2026-W07'; // Default to current mock week

    // Helper to calculate previous week label (simplified for MVP)
    // implementing a robust week decrease is complex, for MVP assuming W06 is prev to W07
    const prevWeek = currentWeek.replace('W07', 'W06');

    // 1. Orders Confirmed This Week
    const ordersCurrent = MOCK_ORDERS.filter(o => o.week_label === currentWeek);
    const confirmedCurrent = ordersCurrent.filter(o => o.status === 'CONFIRMED').length;

    const ordersPrev = MOCK_ORDERS.filter(o => o.week_label === prevWeek);
    // Calculating % change for confirmed orders (using total orders for comparison might be better, but sticking to request)
    // Request says: "Orders Confirmed This Week" -> Show current value.
    // We can compare against Confirmed Last Week or Total Last Week. Let's compare Confirmed vs Confirmed.
    const confirmedPrev = ordersPrev.filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length; // Assuming Delivered were once Confirmed

    const confirmedChange = confirmedPrev === 0 ? 100 : ((confirmedCurrent - confirmedPrev) / confirmedPrev) * 100;

    // 2. Orders Delivered Last Week
    const deliveredLastWeek = ordersPrev.filter(o => o.status === 'DELIVERED').length;
    // Compare to 2 weeks ago? For MVP, let's just show the value or compare to 0 if no data.
    // Let's mock a "2 weeks ago" value of 2 for variation
    const deliveredTwoWeeksAgo = 2;
    const deliveredChange = ((deliveredLastWeek - deliveredTwoWeeksAgo) / deliveredTwoWeeksAgo) * 100;

    // 3. Total Registered Customers
    const totalCustomers = MOCK_CUSTOMERS.length;
    // Mocking previous total
    const prevTotalCustomers = totalCustomers - 1; // 1 new customer
    const customersChange = ((totalCustomers - prevTotalCustomers) / prevTotalCustomers) * 100;

    // 4. Recurring Customers
    // Customers who placed orders in BOTH current_week and last_week
    const customersOrderedCurrent = new Set(ordersCurrent.map(o => o.customer_id));
    const customersOrderedPrev = new Set(ordersPrev.map(o => o.customer_id));

    let recurringCount = 0;
    customersOrderedCurrent.forEach(id => {
        if (customersOrderedPrev.has(id)) {
            recurringCount++;
        }
    });

    // Calculate generic recurring rate or change? 
    // Maybe compare to how many recurred from W05 to W06? 
    // For MVP, let's hardcode a previous recurring count to show change.
    const prevRecurringCount = 2;
    const recurringChange = prevRecurringCount === 0 ? 0 : ((recurringCount - prevRecurringCount) / prevRecurringCount) * 100;

    return NextResponse.json({
        ordersConfirmed: { value: confirmedCurrent, change: confirmedChange },
        ordersDelivered: { value: deliveredLastWeek, change: deliveredChange },
        totalCustomers: { value: totalCustomers, change: customersChange },
        recurringCustomers: { value: recurringCount, change: recurringChange },
    });
}
