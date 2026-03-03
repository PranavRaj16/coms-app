import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized', 401);

        const { id, commentId } = await params;
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const comments: any[] = post.comments as any[];
        const comment = comments.find((c: any) => c._id?.toString() === commentId);
        if (!comment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        // Toggle upvote
        const upvoteIndex = comment.upvotes.indexOf(user._id);
        if (upvoteIndex === -1) {
            comment.upvotes.push(user._id);
        } else {
            comment.upvotes.splice(upvoteIndex, 1);
        }

        await post.save();
        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
