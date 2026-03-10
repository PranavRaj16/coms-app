import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        // 1. Find the workspace of the current user
        const myWs = await Workspace.findOne({ allottedTo: user._id });
        
        if (!myWs) {
            // If user has no workspace, maybe they are an admin or a new member
            // Returning all users if admin, or empty if member?
            // Let's stick to showing everyone if no specific location is found,
            // or maybe just the people at the default location if any.
            // Better: if no workspace, return all users for now OR users with ANY workspace.
            const allUsers = await User.find({ role: { $ne: 'Admin' } }, 'name email role organization joinedDate lastActive');
            const result = allUsers.map(u => ({ user: u, workspaceName: "COMS Ecosystem" }));
            return NextResponse.json(result);
        }

        // 2. Find all workspaces at that location
        const workspacesAtLocation = await Workspace.find({ location: myWs.location })
            .populate('allottedTo', 'name email role organization joinedDate lastActive');

        // 3. Extract unique users (excluding current user) and their workspace names
        const uniqueUsersMap = new Map();
        
        workspacesAtLocation
            .filter(ws => ws.allottedTo && String((ws.allottedTo as any)._id || (ws.allottedTo as any).id) !== String(user._id))
            .forEach(ws => {
                const u = ws.allottedTo as any;
                const userId = String(u._id || u.id);
                if (!uniqueUsersMap.has(userId)) {
                    uniqueUsersMap.set(userId, {
                        user: u,
                        workspaceName: ws.name
                    });
                }
            });

        return NextResponse.json(Array.from(uniqueUsersMap.values()));
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
