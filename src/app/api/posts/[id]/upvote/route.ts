import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const { id } = await params;
        const post = await Post.findById(id);
        const userId = user._id.toString();

        if (post) {
            const index = post.upvotes.indexOf(userId);
            if (index === -1) {
                post.upvotes.push(userId);
            } else {
                post.upvotes.splice(index, 1);
            }

            const updatedPost = await post.save();
            return NextResponse.json(updatedPost);
        } else {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
