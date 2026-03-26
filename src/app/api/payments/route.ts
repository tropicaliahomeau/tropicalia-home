import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            sourceId,
            amount,
            customer,
            email,
            phone,
            cart
        } = body;

        // 1. Process Square Payment
        const idempotencyKey = crypto.randomUUID();
        // Multiply amount by 100 since Square expects cents (or minimum unit) for USD/AUD, etc.
        // E.g., $18.00 -> 1800
        const amountInCents = Math.round(amount * 100);

        const squareResponse = await fetch('https://connect.squareupsandbox.com/v2/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
                'Square-Version': '2024-01-18'
            },
            body: JSON.stringify({
                source_id: sourceId,
                idempotency_key: idempotencyKey,
                amount_money: {
                    amount: amountInCents,
                    currency: 'AUD' // Assuming AUD based on previous tasks, adjust if needed
                }
            })
        });

        const squareData = await squareResponse.json();

        if (!squareResponse.ok || squareData.errors) {
            console.error('Square Payment Error Details:', JSON.stringify(squareData, null, 2));
            return NextResponse.json(
                { success: false, error: 'Error procesando el pago con la tarjeta.' }, 
                { status: 400 }
            );
        }

        // Payment successful!

        // 2. Save customer to Supabase (tabla 'customers')
        // We'll try to insert, and if it fails (e.g. unique email constraint), we just continue. Or upsert.
        await supabase
            .from('customers')
            .upsert({ 
                nombre: customer, 
                email: email, 
                telefono: phone 
            }, { onConflict: 'email' }); // Adjust conflict key if necessary

        // 3. Save order to Supabase (tabla 'orders')
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                nombre_cliente: customer,
                email_cliente: email || '',
                telefono: phone || '',
                total: amount,
                estado: 'pagado', // As requested
                metodo_pago: 'square_card'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 4. Save order items to Supabase (tabla 'order_items')
        const orderItems = [];

        for (const meal of cart.meals) {
            orderItems.push({
                order_id: orderId,
                menu_item_id: meal.id,
                cantidad: 1, 
                precio_unitario: meal.precio || 18.00,
                notas_especiales: ''
            });
        }

        for (const extra of cart.extras) {
            orderItems.push({
                order_id: orderId,
                menu_item_id: extra.id, 
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

        return NextResponse.json({ success: true, orderId: orderId, paymentId: squareData.payment.id });

    } catch (error: any) {
        console.error('API /api/payments Error - FULL TRACE:', error);
        console.error('Error Details / Error Message:', error?.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
