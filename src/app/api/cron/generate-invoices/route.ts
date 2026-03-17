import { NextRequest, NextResponse } from 'next/server';
import { processMonthlyInvoices } from '@/lib/services/invoiceService';

// GET /api/cron/generate-invoices
// Triggered by an automated cron job on the 1st of every month
export async function GET(req: NextRequest) {
    try {
        // Authenticate using a secret key to ensure only authorized cron jobs can trigger this
        const authHeader = req.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        console.log('[CRON_INVOICE] Starting automated monthly invoice generation...');
        const results = await processMonthlyInvoices();
        
        return NextResponse.json({
            message: 'Automated invoice generation completed successfully.',
            ...results
        });
    } catch (error: any) {
        console.error('[CRON_INVOICE] Critical error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
