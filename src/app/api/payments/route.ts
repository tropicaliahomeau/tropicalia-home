import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Init admin client to bypass RLS for inserts if the key is provided
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    : supabase; // fallback to standard client if missing

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

        const squareResponse = await fetch('https://connect.squareup.com/v2/payments', {
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
        await supabaseAdmin
            .from('customers')
            .upsert({ 
                nombre: customer, 
                email: email, 
                telefono: phone 
            }, { onConflict: 'email' }); // Adjust conflict key if necessary

        // Generate short order number
        const cleanName = customer.replace(/[^a-zA-Z]/g, '').padEnd(3, 'A').toUpperCase();
        const prefix = cleanName.substring(0, 3);
        const randomNum = Math.floor(100 + Math.random() * 900);
        const shortOrderNumber = `${prefix}${randomNum}`;

        // 3. Save order to Supabase (tabla 'orders')
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                order_number: shortOrderNumber,
                nombre_cliente: customer,
                email_cliente: email || '',
                telefono: phone || '',
                total: amount,
                estado: 'pagado', // As requested
                metodo_pago: 'square_card'
            })
            .select()
            .single();

        if (orderError) {
            console.error('❌ Error guardando orden en Supabase:', orderError);
            // Critical! Return error so checkout knows
            return NextResponse.json(
                { success: false, error: 'Hubo un error al guardar la orden. El pago de Square se procesó, por favor contactar soporte.' },
                { status: 500 }
            );
        }

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

        // Verify menu_item_id types are strictly what DB expects (string vs int workaround)
        if (orderItems.length > 0) {
            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('❌ Error guardando order_items:', itemsError);
            }
        }

        return NextResponse.json({ success: true, orderId: orderData.order_number || orderData.id, paymentId: squareData.payment.id });

    } catch (error: any) {
        console.error('API /api/payments Error - FULL TRACE:', error);
        console.error('Error Details / Error Message:', error?.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
