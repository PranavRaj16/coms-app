import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { processMonthlyInvoices } from '@/lib/services/invoiceService';

// POST /api/requests/invoices/generate
// Admin triggers this to generate invoices for the current month for all allotted dedicated workspaces
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const results = await processMonthlyInvoices();
        const billingMonthLabel = results.billingMonthLabel;

        return NextResponse.json({
            message: `Invoice generation summary for ${billingMonthLabel}: ${results.generated} created, ${results.alreadyInvoiced} already exist.`,
            ...results,
        });
    } catch (error: any) {
        console.error('[GENERATE] Critical error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

