import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DayPass from '@/models/DayPass';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ passCode: string }> }
) {
    try {
        await connectDB();
        const { passCode } = await params;

        if (!passCode) {
            return NextResponse.json({ message: 'Pass code is required' }, { status: 400 });
        }

        const pass = await DayPass.findOne({ passCode });

        if (!pass) {
            return NextResponse.json({ message: 'Day pass not found' }, { status: 404 });
        }

        if (pass.status === 'Used') {
            return NextResponse.json({
                message: 'This pass has already been used',
                data: pass
            }, { status: 400 });
        }

        if (pass.status === 'Expired') {
            return NextResponse.json({
                message: 'This pass has expired',
                data: pass
            }, { status: 400 });
        }

        // Check if date is valid (today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visitDate = new Date(pass.visitDate);
        visitDate.setHours(0, 0, 0, 0);

        if (visitDate.getTime() !== today.getTime()) {
            const dateStr = visitDate.toLocaleDateString(undefined, { dateStyle: 'long' });
            return NextResponse.json({
                message: `This pass is valid for ${dateStr}, not today.`,
                data: pass
            }, { status: 400 });
        }

        // Mark as used
        pass.status = 'Used';
        await pass.save();

        return NextResponse.json({
            success: true,
            message: 'Day pass authenticated successfully!',
            data: pass
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error verifying day pass' }, { status: 500 });
    }
}
