import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return authResponse('Not authorized');

        const data = await req.json();

        const dbUser = await User.findById(user._id);
        if (!dbUser) return authResponse('User not found', 404);

        dbUser.name = data.name || dbUser.name;
        dbUser.email = data.email || dbUser.email;
        dbUser.mobile = data.mobile || dbUser.mobile;
        dbUser.organization = data.organization || dbUser.organization;

        if (data.password) {
            dbUser.password = data.password;
        }

        const updatedUser = await dbUser.save();

        return NextResponse.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            mobile: updatedUser.mobile,
            organization: updatedUser.organization
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
