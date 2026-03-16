import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';
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
            return NextResponse.json({ message: 'Invalid Booking Request ID format' }, { status: 400 });
        }

        const currentRequest = await BookingRequest.findById(id);
        if (!currentRequest) {
            return NextResponse.json({ message: 'Booking request not found' }, { status: 404 });
        }

        const oldStatus = currentRequest.status;
        const updatedRequest = await BookingRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        // Case 1: Releasing seats (Cancelled/Rejected/Declined/Completed)
        const releasingStatuses = ['Cancelled', 'Rejected', 'Declined', 'Completed'];
        if (updatedRequest && releasingStatuses.includes(status) && !releasingStatuses.includes(oldStatus)) {
            const Workspace = (await import('@/models/Workspace')).default;
            const workspace = await Workspace.findById(updatedRequest.workspaceId);
            
            if (workspace && workspace.type === 'Open WorkStation' && updatedRequest.seatCount) {
                await Workspace.findByIdAndUpdate(updatedRequest.workspaceId, {
                    $inc: { availableSeats: updatedRequest.seatCount }
                });
            } else if (workspace && workspace.type !== 'Open WorkStation') {
                if (workspace.allottedTo?.toString() === updatedRequest.userId?.toString()) {
                     await Workspace.findByIdAndUpdate(updatedRequest.workspaceId, {
                        allottedTo: null,
                        allotmentStart: null,
                        allotmentEnd: null
                    });
                }
            }
        }

        // Case 2: Allocating seats (Confirmed/Awaiting Payment)
        const allocatingStatuses = ['Confirmed', 'Awaiting Payment'];
        if (updatedRequest && allocatingStatuses.includes(status) && !allocatingStatuses.includes(oldStatus) && releasingStatuses.includes(oldStatus)) {
            const Workspace = (await import('@/models/Workspace')).default;
            const workspace = await Workspace.findById(updatedRequest.workspaceId);
            
            if (workspace && workspace.type === 'Open WorkStation' && updatedRequest.seatCount) {
                await Workspace.findByIdAndUpdate(updatedRequest.workspaceId, {
                    $inc: { availableSeats: -updatedRequest.seatCount }
                });
            } else if (workspace && workspace.type !== 'Open WorkStation') {
                // Find User ID for the request
                const bookingUserId = updatedRequest.userId || (await (await import('@/models/User')).default.findOne({ email: updatedRequest.email }))?._id;
                if (bookingUserId) {
                    await Workspace.findByIdAndUpdate(updatedRequest.workspaceId, {
                        allottedTo: bookingUserId,
                        allotmentStart: updatedRequest.startDate,
                        allotmentEnd: updatedRequest.endDate
                    });
                }
            }
        }

        if (updatedRequest) {
            return NextResponse.json(updatedRequest);
        } else {
            return NextResponse.json({ message: 'Booking request not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
