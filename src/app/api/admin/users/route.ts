import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmekzaulujsgnqiwtsfz.supabase.co';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
        return NextResponse.json({
            error: 'MISSING_SERVICE_ROLE_KEY',
            message: 'SUPABASE_SERVICE_ROLE_KEY is not defined. Please add it to Vercel and your .env.local file.'
        }, { status: 400 });
    }

    try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Fetch users from Supabase Auth
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (usersError) {
            console.error("Auth Admin Error:", usersError);
            throw usersError;
        }

        // 2. Fetch order count by customer email
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('email_cliente');
        
        if (ordersError) {
            console.error("Database Orders Error:", ordersError);
            throw ordersError;
        }

        const orderCounts: Record<string, number> = {};
        if (orders) {
            orders.forEach(o => {
                if (o.email_cliente) {
                    const email = o.email_cliente.toLowerCase().trim();
                    orderCounts[email] = (orderCounts[email] || 0) + 1;
                }
            });
        }

        // 3. Map users
        const mappedUsers = users.map(user => {
            const email = user.email ? user.email.toLowerCase().trim() : '';
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'N/A';
            const phone = user.phone || user.user_metadata?.phone || 'N/A';
            const createdAt = user.created_at;

            return {
                id: user.id,
                full_name: fullName,
                email: user.email || 'N/A',
                phone: phone,
                created_at: createdAt,
                orders_count: orderCounts[email] || 0
            };
        });

        return NextResponse.json(mappedUsers);
    } catch (error: any) {
        console.error('Error fetching registered users:', error);
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
    }
}
