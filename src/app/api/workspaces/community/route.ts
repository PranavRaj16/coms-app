import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace, { IWorkspace } from '@/models/Workspace';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        // 1. Find the workspaces of the current user to get their locations
        // Supporting both ObjectId and String ID for robustness
        const myWorkspaces = await Workspace.find({ 
            $or: [
                { allottedTo: user._id },
                { allottedTo: user._id.toString() }
            ]
        });
        
        let query = {};
        if (user.role !== 'Admin') {
            if (myWorkspaces.length === 0) {
                // If user has no workspace, they are not present in any location
                // and thus have no neighbours.
                return NextResponse.json([]);
            }
            const locations = myWorkspaces.map(ws => ws.location);
            query = { location: { $in: locations } };
        }

        // 2. Find all workspaces matching the query
        const workspacesAtLocations = await Workspace.find(query)
            .populate('allottedTo', 'name email role organization joinedDate lastActive');

        // 3. Extract unique users (excluding current user) and their workspace names
        const uniqueUsersMap = new Map();
        
        workspacesAtLocations
            .filter((ws: IWorkspace) => ws.allottedTo && String((ws.allottedTo as any)._id || (ws.allottedTo as any).id) !== String(user._id))
            .forEach((ws: IWorkspace) => {
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
