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
            .populate('workspaceId')
            .sort({ createdAt: -1 });

        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const result = await Invoice.deleteMany({
            type: 'recurring',
            billingMonth: billingMonth
        });

        return NextResponse.json({ 
            message: `Cleared ${result.deletedCount} recurring invoices for ${billingMonth}`,
            deletedCount: result.deletedCount 
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
