import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string, commentId: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const { id, commentId } = await params;
        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const commentIndex = post.comments.findIndex((c: any) => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        const comment = post.comments[commentIndex];
        
        // Authorization check: Commenter OR Post Author OR Admin
        const isCommentAuthor = comment.user.toString() === user._id.toString();
        const isPostAuthor = post.author.toString() === user._id.toString();
        const isAdmin = user.role === 'Admin';

        if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
            return authResponse('Not authorized to delete this comment. Only the commenter, story author, or admin can remove it.', 401);
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        
        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
