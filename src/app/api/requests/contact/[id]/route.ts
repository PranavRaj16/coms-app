import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactRequest from '@/models/ContactRequest';
import { getAuthUser, authResponse } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ message: 'Status is required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Contact Request ID format' }, { status: 400 });
        }

        const updatedRequest = await ContactRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (updatedRequest) {
            return NextResponse.json(updatedRequest);
        } else {
            return NextResponse.json({ message: 'Contact inquiry not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
