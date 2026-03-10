import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const { id } = await params;
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const isAdmin = user.role === 'Admin';
        if (post.author.toString() !== user._id.toString() && !isAdmin) {
            return authResponse('Not authorized to delete this post. Only the author or an admin can remove stories.', 401);
        }

        await post.deleteOne();
        return NextResponse.json({ message: 'Post removed' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
