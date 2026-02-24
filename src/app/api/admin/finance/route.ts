import { NextRequest, NextResponse } from 'next/server';
import { MOCK_FINANCE, MOCK_ORDERS } from '@/data/mockAdminData';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const weekLabel = searchParams.get('week_label');

    if (weekLabel) {
        const data = MOCK_FINANCE.find(f => f.week_label === weekLabel);
        return NextResponse.json(data || null);
    }

    // Return all finance records sorted by date descending?
    // Let's return all for the list view
    return NextResponse.json(MOCK_FINANCE);
}
