import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { customerEmail: user.email };
        }

        const invoices = await Invoice.find(query)
            .populate('bookingId')
            .sort({ createdAt: -1 });

        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
