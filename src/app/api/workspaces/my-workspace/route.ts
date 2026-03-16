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

        // 1. Traditional single-user allotments
        const traditionalWorkspaces = await Workspace.find({
            allottedTo: user._id,
            $or: [
                { allotmentStart: { $exists: false } },
                { allotmentStart: null },
                { allotmentStart: { $lte: now } }
            ]
        });

        // 2. Open Workstation / Partial bookings
        // Find confirmed bookings for this user that are currently active
        const BookingRequest = (await import('@/models/BookingRequest')).default;
        const confirmedBookings = await BookingRequest.find({
            email: user.email,
            status: { $in: ['Confirmed', 'Awaiting Payment'] },
            startDate: { $lte: now }
        });

        const workspaceIdsFromBookings = confirmedBookings.map(b => b.workspaceId);
        const bookedWorkspaces = await Workspace.find({
            _id: { $in: workspaceIdsFromBookings },
            type: "Open WorkStation"
        });

        // Combine and de-duplicate
        const allWorkspaces = [...traditionalWorkspaces.map(w => w.toObject())];
        
        for (const bw of bookedWorkspaces) {
            const booking = confirmedBookings.find(b => b.workspaceId.toString() === bw._id.toString());
            const wsObj = bw.toObject();
            if (booking) {
                wsObj.bookedSeats = booking.seatCount || 1;
            }
            if (!allWorkspaces.find(aw => aw._id.toString() === wsObj._id.toString())) {
                allWorkspaces.push(wsObj);
            }
        }

        return NextResponse.json(allWorkspaces);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
