import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Agreement from '@/models/Agreement';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/agreements — Admin: all agreements; Member: their own
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        let agreements;
        if (user.role === 'Admin') {
            agreements = await Agreement.find({})
                .populate('userId', 'name email')
                .populate('workspaceId', 'name location')
                .sort({ createdAt: -1 });
        } else {
            agreements = await Agreement.find({ userId: user._id })
                .populate('workspaceId', 'name location')
                .sort({ createdAt: -1 });
        }

        return NextResponse.json(agreements);
    } catch (error: any) {
        console.error('[API AGREEMENTS] GET error:', error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/agreements — Admin only: upload PDF and assign to user
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');
        if (user.role !== 'Admin') return authResponse('Only admins can upload agreements', 403);

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const userId = formData.get('userId') as string;
        const workspaceId = formData.get('workspaceId') as string | null;
        const startDate = formData.get('startDate') as string | null;
        const endDate = formData.get('endDate') as string | null;
        const notes = formData.get('notes') as string | null;

        if (!file) return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        if (!userId) return NextResponse.json({ message: 'userId is required' }, { status: 400 });

        // Validate PDF
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ message: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Get user & workspace info
        const targetUser = await User.findById(userId);
        if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        let workspaceName = 'General';
        let wsDoc = null;
        if (workspaceId) {
            wsDoc = await Workspace.findById(workspaceId);
            if (wsDoc) workspaceName = wsDoc.name;
        }

        // Upload PDF to Cloudinary as raw resource
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'agreements',
                    public_id: `agreement_${userId}_${Date.now()}`,
                    format: 'pdf',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Save agreement record
        const agreement = await Agreement.create({
            userId,
            workspaceId: workspaceId || null,
            workspaceName,
            userName: targetUser.name,
            userEmail: targetUser.email,
            fileUrl: uploadResult.secure_url,
            fileName: file.name,
            publicId: uploadResult.public_id,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            uploadedBy: user._id,
            notes: notes || ''
        });

        return NextResponse.json(agreement, { status: 201 });
    } catch (error: any) {
        console.error('[API AGREEMENTS] POST error:', error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
