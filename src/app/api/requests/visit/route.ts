import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import VisitRequest from '@/models/VisitRequest';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { email: user.email };
        }

        const requests = await VisitRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const requiredFields = ['fullName', 'email', 'contactNumber', 'visitDate', 'workspaceId', 'workspaceName'];
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

        const createdRequest = await VisitRequest.create(body);
        return NextResponse.json(createdRequest, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
