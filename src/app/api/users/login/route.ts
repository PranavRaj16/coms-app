import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import generateToken from '@/utils/generateToken';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log(`Login successful for user: ${email}`);
            if (user.status === 'Inactive') {
                return NextResponse.json({ message: 'Your account is inactive. Please contact support.' }, { status: 403 });
            }

            let finalStatus = user.status;
            if (user.status === 'Pending') {
                await user.constructor.updateOne({ _id: user._id }, { status: 'Active' });
                finalStatus = 'Active';
            }

            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: finalStatus,
                token: generateToken(user._id),
            });
        } else {
            if (user) {
                console.log(`Login failed for ${email}: Incorrect password`);
            } else {
                console.log(`Login failed for ${email}: User not found`);
            }
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
