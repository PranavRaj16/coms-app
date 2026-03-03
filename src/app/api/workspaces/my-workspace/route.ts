import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const workspace = await Workspace.findOne({ allottedTo: user._id });
        return NextResponse.json(workspace || null);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
