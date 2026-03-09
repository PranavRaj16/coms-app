import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import QuoteRequest from '@/models/QuoteRequest';
import ContactRequest from '@/models/ContactRequest';
import BookingRequest from '@/models/BookingRequest';
import VisitRequest from '@/models/VisitRequest';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
            return authResponse('Not authorized', 403);
        }

        const totalUsers = await User.countDocuments();
        const totalWorkspaces = await Workspace.countDocuments();
        const pendingQuotes = await QuoteRequest.countDocuments({ status: 'Pending' });
        const pendingBookings = await BookingRequest.countDocuments({ status: 'Pending' });
        const pendingContacts = await ContactRequest.countDocuments({ status: 'Pending' });
        const pendingVisits = await VisitRequest.countDocuments({ status: 'Pending' });

        return NextResponse.json({
            totalUsers,
            activeMembers: 0, // Need logic if active members means something specific, otherwise 0
            newQuoteRequests: pendingQuotes,
            newBookingRequests: pendingBookings,
            newVisitRequests: pendingVisits,
            totalWorkspaces,
            pendingContacts,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
