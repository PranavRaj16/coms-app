import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        let query = {};
        
        // Admins can see all posts. Others can only see posts in their location.
        if (user.role !== 'Admin') {
            // Check for both ObjectId and String ID match to be safe
            const myWorkspaces = await Workspace.find({ 
                $or: [
                    { allottedTo: user._id },
                    { allottedTo: user._id.toString() }
                ]
            });
            
            console.log(`[API POSTS] User: ${user.name}, Role: ${user.role}, Workspaces count: ${myWorkspaces.length}`);
            
            if (myWorkspaces.length === 0) {
                console.log(`[API POSTS] User ${user.name} has no workspace allotted.`);
                return NextResponse.json([]);
            }
            
            const locations = myWorkspaces.map(ws => ws.location);
            // Always include Global posts for everyone with a workspace
            if (!locations.includes('Global')) locations.push('Global');
            
            console.log(`[API POSTS] User locations: ${locations.join(', ')}`);
            // Match posts in user's locations OR posts with no location field (Global fallback)
            query = { 
                $or: [
                    { location: { $in: locations } },
                    { location: { $exists: false } }
                ]
            };
        } else {
            console.log(`[API POSTS] Admin access granted to ${user.name}`);
        }

        console.log(`[API POSTS] Executing query: ${JSON.stringify(query)}`);
        const posts = await Post.find(query)
            .populate('author', 'name role organization')
            .populate('comments.user', 'name role organization')
            .populate('comments.replies.user', 'name role organization')
            .sort({ createdAt: -1 });
        
        console.log(`[API POSTS] Found ${posts.length} posts.`);
        return NextResponse.json(posts);
    } catch (error: any) {
        console.error(`[API POSTS] ERROR: ${error.message}`);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const myWorkspaces = await Workspace.find({ 
            $or: [
                { allottedTo: user._id },
                { allottedTo: user._id.toString() }
            ]
        });
        
        if (myWorkspaces.length === 0 && user.role !== 'Admin') {
            return NextResponse.json({ message: 'You must have an allotted workspace to post.' }, { status: 403 });
        }
        const data = await req.json();
        
        // Determine location: User's first workspace location or Global fallback
        let postLocation = data.location;
        if (!postLocation) {
             postLocation = myWorkspaces.length > 0 ? myWorkspaces[0].location : "Global";
        }
        
        console.log(`[API POSTS] Creating post for user ${user._id} at location: ${postLocation}`);

        const post = await Post.create({
            ...data,
            author: user._id,
            authorName: data.authorName || user.name || (user as any).displayName || 'Anonymous',
            location: postLocation
        });

        const populatedPost = await Post.findById(post._id).populate('author', 'name role organization');

        return NextResponse.json(populatedPost, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
