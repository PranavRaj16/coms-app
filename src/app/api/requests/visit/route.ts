import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import VisitRequest from '@/models/VisitRequest';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';

export async function GET(req: NextRequest) {
    try {
        console.log('[API] GET /api/requests/visit - Connecting to DB');
        await connectDB();

        console.log('[API] GET /api/requests/visit - Authenticating user');
        const user = await getAuthUser(req);
        console.log('[API] GET /api/requests/visit - User:', user ? user.email : 'Anonymous', 'Role:', user ? user.role : 'N/A');

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { email: user.email };
        }

        console.log('[API] GET /api/requests/visit - Executing query:', JSON.stringify(query));
        const requests = await VisitRequest.find(query).sort({ createdAt: -1 });
        console.log('[API] GET /api/requests/visit - Found', requests.length, 'requests');

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error('[API] GET /api/requests/visit - Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Dynamically fetch workspaceName if missing
        if (body.workspaceId && !body.workspaceName) {
            const Workspace = (await import('@/models/Workspace')).default;
            const workspace = await Workspace.findById(body.workspaceId);
            if (workspace) {
                body.workspaceName = workspace.name;
            }
        }

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
        console.error('[API] POST /api/requests/visit - Error:', error);
        return NextResponse.json({ message: error.message || 'Error creating visit request' }, { status: 500 });
    }
}
