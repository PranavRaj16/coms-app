import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import QuoteRequest from '@/models/QuoteRequest';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { workEmail: user.email };
        }

        const requests = await QuoteRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const requiredError = checkRequiredFields(body, ['fullName', 'workEmail', 'requiredWorkspace', 'firmName', 'contactNumber']);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        if (!validateEmail(body.workEmail)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        if (body.contactNumber && !validateMobile(body.contactNumber)) {
            return NextResponse.json({ message: 'Invalid contact number format' }, { status: 400 });
        }

        const createdRequest = await QuoteRequest.create(body);
        return NextResponse.json(createdRequest, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
