import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const now = new Date();

        // Find a workspace allotted to this user whose start date is still in the future (pre-booked)
        const workspaces = await Workspace.find({
            allottedTo: user._id,
            allotmentStart: { $gt: now }
        });

        return NextResponse.json(workspaces);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
