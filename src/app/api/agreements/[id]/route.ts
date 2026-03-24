import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Agreement from '@/models/Agreement';
import { getAuthUser, authResponse } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE /api/agreements/[id] — Admin only
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');
        if (user.role !== 'Admin') return authResponse('Only admins can delete agreements', 403);

        const { id } = await params;
        const agreement = await Agreement.findById(id);
        if (!agreement) return NextResponse.json({ message: 'Agreement not found' }, { status: 404 });

        // Remove from Cloudinary
        try {
            await cloudinary.uploader.destroy(agreement.publicId, { resource_type: 'raw' });
        } catch (cloudErr) {
            console.warn('[API AGREEMENTS] Cloudinary deletion failed (continuing):', cloudErr);
        }

        await agreement.deleteOne();
        return NextResponse.json({ message: 'Agreement deleted successfully' });
    } catch (error: any) {
        console.error('[API AGREEMENTS] DELETE error:', error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
