import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';
import { checkRequiredFields } from '@/utils/validation';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const { id } = await params;
        const body = await req.json();
        const { text, userName } = body;

        const requiredError = checkRequiredFields(body, ['text', 'userName']);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        const post = await Post.findById(id);

        if (post) {
            const comment = {
                user: user._id,
                userName,
                text,
                createdAt: new Date(),
                upvotes: [],
                replies: []
            };

            post.comments.push(comment as any);
            await post.save();
            const populatedPost = await Post.findById(post._id)
                .populate('author', 'name role organization')
                .populate('comments.user', 'name role organization')
                .populate('comments.replies.user', 'name role organization')
                .sort({ createdAt: -1 });

            return NextResponse.json(populatedPost, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
