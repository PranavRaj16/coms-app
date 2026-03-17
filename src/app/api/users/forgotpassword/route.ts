import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import sendEmail from '@/utils/sendEmail';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email } = await req.json();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'If a user with that email exists, a reset link has been sent.' }, { status: 200 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (30 minutes)
        user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);

        await user.save();

        // Create reset url
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <div style="background-color: #000; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">COHORT ECOSYSTEM</h1>
                </div>
                <div style="background-color: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">You are receiving this email because you (or someone else) has requested the reset of a password for your account.</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                           Reset Your Password
                        </a>
                    </div>

                    <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>

                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                        Automated message from Cohort Management System. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - Cohort Ecosystem',
                message,
            });

            return NextResponse.json({ message: 'Email sent' }, { status: 200 });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return NextResponse.json({ message: 'Email could not be sent' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
