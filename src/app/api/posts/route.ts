import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const posts = await Post.find({})
            .populate('author', 'name role organization')
            .populate('comments.user', 'name role organization')
            .populate('comments.replies.user', 'name role organization')
            .sort({ createdAt: -1 });

        return NextResponse.json(posts);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const data = await req.json();
        const post = await Post.create({
            ...data,
            author: user._id,
            authorName: data.authorName || user.name || (user as any).displayName || 'Anonymous'
        });

        const populatedPost = await Post.findById(post._id).populate('author', 'name role organization');

        return NextResponse.json(populatedPost, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
