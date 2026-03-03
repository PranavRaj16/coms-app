import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const workspace = await Workspace.findById(id);
        if (!workspace) return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') return authResponse('Not authorized', 403);

        const { id } = await params;
        const data = await req.json();
        const workspace = await Workspace.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') return authResponse('Not authorized', 403);

        const { id } = await params;
        await Workspace.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Workspace deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
