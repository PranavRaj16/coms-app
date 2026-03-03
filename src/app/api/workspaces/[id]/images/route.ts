import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') return authResponse('Not authorized', 403);

        const { id } = await params;
        const workspace = await Workspace.findById(id);
        if (!workspace) return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });

        const formData = await req.formData();
        const images = formData.getAll('images') as File[];

        if (!images || images.length === 0) {
            return NextResponse.json({ message: 'No images uploaded' }, { status: 400 });
        }

        const imageUrls: string[] = [];

        for (const image of images) {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    folder: 'coms-workspaces',
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result?.secure_url);
                }).end(buffer);
            });

            const url = await uploadPromise as string;
            imageUrls.push(url);
        }

        const totalImages = [...(workspace.images || []), ...imageUrls].slice(0, 3);
        workspace.images = totalImages;
        if (totalImages.length > 0) {
            workspace.image = totalImages[0];
        }

        await workspace.save();
        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
