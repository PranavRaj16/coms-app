import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string, commentId: string, replyId: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const { id, commentId, replyId } = await params;
        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const comment = post.comments.find((c: any) => c._id.toString() === commentId);
        if (!comment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        let replyToDelete: any = null;
        let parentCollection: any[] = comment.replies;
        let deleteIndex = -1;

        // Search top-level replies
        deleteIndex = comment.replies.findIndex((r: any) => r._id.toString() === replyId);
        if (deleteIndex !== -1) {
            replyToDelete = comment.replies[deleteIndex];
        } else {
            // Search second-level replies
            for (const r of comment.replies) {
                if (r.replies) {
                    const subIndex = r.replies.findIndex((sr: any) => sr._id.toString() === replyId);
                    if (subIndex !== -1) {
                        replyToDelete = r.replies[subIndex];
                        parentCollection = r.replies;
                        deleteIndex = subIndex;
                        break;
                    }
                }
            }
        }

        if (!replyToDelete) {
            return NextResponse.json({ message: 'Reply not found' }, { status: 404 });
        }

        // Authorization check: ONLY the original replier can delete their reply
        const isReplier = replyToDelete.user.toString() === user._id.toString();

        if (!isReplier) {
            return authResponse('Only the author of this reply can delete it.', 403);
        }

        parentCollection.splice(deleteIndex, 1);
        await post.save();
        
        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
