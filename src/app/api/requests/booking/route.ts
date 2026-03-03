import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';
import Workspace from '@/models/Workspace';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { email: user.email };
        }

        const requests = await BookingRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        const body = await req.json();

        const requiredFields = ['fullName', 'email', 'contactNumber', 'duration', 'startDate', 'workspaceId', 'workspaceName', 'paymentMethod'];
        const requiredError = checkRequiredFields(body, requiredFields);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        if (!validateEmail(body.email)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        if (body.contactNumber && !validateMobile(body.contactNumber)) {
            return NextResponse.json({ message: 'Invalid contact number format' }, { status: 400 });
        }

        const workspace = await Workspace.findById(body.workspaceId);
        if (!workspace) {
            return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
        }

        // Calculate duration months
        let durationMonths = 0;
        const durationStr = body.duration;
        const parts = durationStr.split(" ");
        const num = parseFloat(parts[0]);
        const unit = parts[1]?.toLowerCase() || 'months';

        if (unit.startsWith('year')) durationMonths = num * 12;
        else if (unit.startsWith('month')) durationMonths = num;
        else if (unit.startsWith('week')) durationMonths = num / 4.34;
        else if (unit.startsWith('day')) durationMonths = num / 30.44;
        else if (unit.startsWith('hour')) durationMonths = num / (30.44 * 24);

        const totalAmount = Math.ceil(workspace.price * durationMonths);
        const invoiceId = `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Calculate allotment dates
        const allotStart = new Date(body.startDate);
        const allotEnd = new Date(allotStart);
        if (unit.startsWith('year')) allotEnd.setFullYear(allotEnd.getFullYear() + num);
        else if (unit.startsWith('month')) allotEnd.setMonth(allotEnd.getMonth() + num);
        else if (unit.startsWith('week')) allotEnd.setDate(allotEnd.getDate() + num * 7);
        else if (unit.startsWith('day')) allotEnd.setDate(allotEnd.getDate() + num);
        else if (unit.startsWith('hour')) allotEnd.setHours(allotEnd.getHours() + num);

        const bookingData = {
            ...body,
            totalAmount,
            invoiceId,
            paymentStatus: body.paymentMethod === 'Pay Now' ? 'Paid' : 'Pending',
            status: body.paymentMethod === 'Pay Now' ? 'Confirmed' : 'Awaiting Payment'
        };

        const createdBooking = await BookingRequest.create(bookingData);

        // Auto Allotment if Paid
        if (body.paymentMethod === 'Pay Now') {
            let bookingUserId = user?._id;
            if (!bookingUserId) {
                const foundUser = await User.findOne({ email: body.email });
                if (foundUser) bookingUserId = foundUser._id;
            }

            if (bookingUserId) {
                await Workspace.findByIdAndUpdate(body.workspaceId, {
                    allottedTo: bookingUserId,
                    allotmentStart: allotStart,
                    allotmentEnd: allotEnd
                });
            }
        }

        // Create Invoice
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const invoiceData = {
            invoiceNumber: invoiceId,
            bookingId: createdBooking._id,
            userId: user?._id || null,
            customerName: body.fullName,
            customerEmail: body.email,
            workspaceName: body.workspaceName,
            amount: totalAmount,
            paymentMethod: body.paymentMethod,
            status: bookingData.paymentStatus,
            dueDate: dueDate,
            paidDate: body.paymentMethod === 'Pay Now' ? new Date() : undefined
        };

        if (!invoiceData.userId) {
            const foundUser = await User.findOne({ email: body.email });
            if (foundUser) invoiceData.userId = foundUser._id;
        }

        const createdInvoice = await Invoice.create(invoiceData);

        return NextResponse.json({
            booking: createdBooking,
            invoice: createdInvoice
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
