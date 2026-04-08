import { NextResponse } from 'next/server';
import { processMonthlyInvoices } from '@/lib/services/invoiceService';

// This endpoint can be triggered by an external cron job (e.g. GitHub Actions, Vercel Crons, etc.)
// It is designed to create March invoices every day at 6:30 PM IST if the current month is April.
export async function GET(req: Request) {
    try {
        const now = new Date();
        
        // 1. Month/Day Check
        // Executing only on the 1st of every month
        if (now.getDate() !== 1 && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ 
                message: "This task is restricted to the 1st day of the month.",
                currentDay: now.getDate()
            });
        }
 
        // 2. Time Check (Target: 10:00 AM IST)
        const istTime = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);
        
        const [hours, minutes] = istTime.split(':').map(Number);
        
        // Window check (10:00 AM to 10:15 AM IST)
        const isTargetTime = (hours === 10 && minutes >= 0 && minutes <= 15); 
        
        if (!isTargetTime && process.env.NODE_ENV === 'production') {
             console.log(`[CRON] Skipping - Triggered at ${istTime} IST, Target is 10:00 AM IST`);
             return NextResponse.json({ message: "Not triggered - Scheduled for 10:00 AM IST", currentTime: istTime });
        }
 
        console.log(`[CRON] Executing automated monthly invoice generation at ${istTime} IST`);
 
        // 3. User Authorization (Optional but recommended)
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');
        const CRON_SECRET = process.env.CRON_SECRET || 'cohort_cron_task_2026';
        
        if (secret !== CRON_SECRET) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
 
        // 4. Target Month Calculation (Previous month)
        const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); 
 
        // 5. Execution
        const results = await processMonthlyInvoices(previousMonthDate);
 
        return NextResponse.json({
            message: "Automated monthly invoice generation executed.",
            istTime,
            targetMonth: previousMonthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
            ...results
        });

    } catch (error: any) {
        console.error('[CRON_INVOICE] Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
