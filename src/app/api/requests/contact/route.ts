import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactRequest from '@/models/ContactRequest';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const requests = await ContactRequest.find({}).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const requiredError = checkRequiredFields(body, ['name', 'email', 'subject', 'message']);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        if (!validateEmail(body.email)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        if (body.phone && !validateMobile(body.phone)) {
            return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
        }

        const createdRequest = await ContactRequest.create(body);
        return NextResponse.json(createdRequest, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
