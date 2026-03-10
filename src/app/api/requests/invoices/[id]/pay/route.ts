import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import { getAuthUser } from '@/lib/auth';

// PUT /api/requests/invoices/[id]/pay
// User pays their pending invoice
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
        }

        // Only the invoice owner or admin can pay
        if (
            user.role !== 'Admin' &&
            invoice.userId?.toString() !== user._id?.toString() &&
            invoice.customerEmail !== user.email
        ) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (invoice.status === 'Paid') {
            return NextResponse.json({ message: 'Invoice already paid' }, { status: 400 });
        }

        invoice.status = 'Paid';
        invoice.paidDate = new Date();
        await invoice.save();

        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
