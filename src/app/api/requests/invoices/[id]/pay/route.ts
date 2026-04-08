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

        // Send confirmation email
        try {
            const User = (await import('@/models/User')).default;
            const Workspace = (await import('@/models/Workspace')).default;
            const { sendInvoiceEmail } = await import('@/lib/services/invoiceService');

            const invoiceUser = await User.findById(invoice.userId);
            const workspace = await Workspace.findById(invoice.workspaceId);

            if (invoiceUser && workspace) {
                let billingMonthLabel = '';
                if (invoice.billingMonth) {
                    const [year, month] = invoice.billingMonth.split('-').map(Number);
                    billingMonthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { 
                        month: 'long', 
                        year: 'numeric' 
                    });
                }

                const workspaceSubtotal = (invoice.subtotal || 0) - (invoice.carParkingAmount || 0);

                await sendInvoiceEmail(
                    invoice, 
                    invoiceUser, 
                    workspace, 
                    billingMonthLabel, 
                    invoice.dueDate, 
                    workspaceSubtotal
                );
            }
        } catch (emailError: any) {
            console.error('[INVOICE_PAY] Post-payment email error:', emailError.message);
            // Don't fail the request if only the email fails
        }

        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
