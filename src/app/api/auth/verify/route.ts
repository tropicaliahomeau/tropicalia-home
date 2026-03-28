import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { area, password } = await request.json();
        
        let validPassword = null;
        
        if (area === 'admin') {
            validPassword = process.env.ADMIN_PASSWORD;
        } else if (area === 'kitchen') {
            validPassword = process.env.KITCHEN_PASSWORD;
        }

        if (!validPassword) {
            // Environment variable not set in server/Vercel
            return NextResponse.json({ success: false, error: 'Auth not configured on server' }, { status: 500 });
        }

        if (password === validPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
