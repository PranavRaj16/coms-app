import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, validateMobile } from '@/utils/validation';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const { id } = await params;
        const body = await req.json();

        const dbUser = await User.findById(id);
        if (dbUser) {
            if (body.email && !validateEmail(body.email)) {
                return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
            }

            if (body.mobile && !validateMobile(body.mobile)) {
                return NextResponse.json({ message: 'Invalid mobile number format' }, { status: 400 });
            }

            dbUser.name = body.name || dbUser.name;
            dbUser.email = body.email || dbUser.email;
            dbUser.role = body.role || dbUser.role;
            dbUser.mobile = body.mobile || dbUser.mobile;
            dbUser.organization = body.organization || dbUser.organization;
            dbUser.status = body.status || dbUser.status;
            dbUser.includeGST = body.includeGST !== undefined ? body.includeGST : dbUser.includeGST;
            dbUser.includeCarParking = body.includeCarParking !== undefined ? body.includeCarParking : dbUser.includeCarParking;
            dbUser.carParkingSlots = body.carParkingSlots !== undefined ? body.carParkingSlots : dbUser.carParkingSlots;
            dbUser.carParkingPricePerSlot = body.carParkingPricePerSlot !== undefined ? body.carParkingPricePerSlot : dbUser.carParkingPricePerSlot;
            dbUser.memberType = body.memberType !== undefined ? body.memberType : dbUser.memberType;

            const updatedUser = await dbUser.save();
            return NextResponse.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organization: updatedUser.organization,
                mobile: updatedUser.mobile,
                status: updatedUser.status,
                joinedDate: updatedUser.joinedDate,
                lastActive: updatedUser.lastActive,
                includeGST: updatedUser.includeGST,
                includeCarParking: updatedUser.includeCarParking,
                carParkingSlots: updatedUser.carParkingSlots,
                carParkingPricePerSlot: updatedUser.carParkingPricePerSlot,
                memberType: updatedUser.memberType
            });
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const { id } = await params;
        const dbUser = await User.findById(id);
        if (dbUser) {
            await dbUser.deleteOne();
            return NextResponse.json({ message: 'User removed' });
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
