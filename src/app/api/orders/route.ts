import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer,
            email,
            phone,
            status,
            total,
            paymentMethod,
            cart
        } = body;

        // 1. Insert into orders table
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                nombre_cliente: customer,
                email_cliente: email || '',
                telefono: phone || '',
                total: total,
                estado: status,
                metodo_pago: paymentMethod
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 2. Insert into order_items table
        const orderItems = [];

        // Add meals
        for (const meal of cart.meals) {
            orderItems.push({
                order_id: orderId,
                menu_item_id: meal.id,
                cantidad: 1, // Meals are usually quantity 1 per item selected in this flow
                precio_unitario: meal.precio || 18.00,
                notas_especiales: ''
            });
        }

        // Add extras
        for (const extra of cart.extras) {
            orderItems.push({
                order_id: orderId,
                menu_item_id: extra.id, // Assuming extra id is valid for menu_item_id or handled appropriately
                cantidad: extra.quantity,
                precio_unitario: extra.price,
                notas_especiales: ''
            });
        }

        if (orderItems.length > 0) {
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;
        }

        return NextResponse.json({ success: true, orderId: orderId });
    } catch (error: any) {
        console.error('API /api/orders Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
