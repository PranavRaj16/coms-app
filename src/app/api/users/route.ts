import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, validatePassword, checkRequiredFields, validateMobile } from '@/utils/validation';
import sendEmail from '@/utils/sendEmail';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        // User creation can be public (signup) or admin (member add)
        // For now, let's keep it similar to the controller

        const body = await req.json();
        const { name, email, role, mobile, organization, password } = body;

        const requiredError = checkRequiredFields(body, ['name', 'email']);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        if (!validateEmail(email)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        if (password && !validatePassword(password)) {
            return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
        }

        if (mobile && !validateMobile(mobile)) {
            return NextResponse.json({ message: 'Invalid mobile number format' }, { status: 400 });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const userPassword = password || 'password123';
        const newUser = await User.create({
            name,
            email,
            password: userPassword,
            role: role || 'Member',
            status: body.status || 'Active',
            mobile,
            organization
        });

        if (newUser) {
            try {
                await sendEmail({
                    email: newUser.email,
                    subject: 'Welcome to Cohort Management Ecosystem',
                    message: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <div style="background-color: #000; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">COHORT ECOSYSTEM</h1>
                </div>
                <div style="background-color: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h2 style="color: #333; margin-top: 0;">Welcome, ${newUser.name}!</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Your account has been successfully created. You now have access to the Cohort Management Ecosystem dashboard.</p>
                    
                    <div style="background-color: #f4f7f6; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #e1e8e7;">
                        <p style="margin-top: 0; font-weight: bold; color: #444;">Your Access Credentials:</p>
                        <p style="margin: 10px 0; color: #555;"><strong>Email:</strong> <span style="color: #000; font-family: monospace;">${newUser.email}</span></p>
                        <p style="margin: 10px 0; color: #555;"><strong>Temporary Password:</strong> <span style="color: #000; font-family: monospace;">${userPassword}</span></p>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                           style="background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                           Sign In to Ecosystem
                        </a>
                    </div>

                    <div style="background-color: #fff9e6; padding: 20px; border-left: 4px solid #ffcc00; margin-bottom: 30px;">
                        <p style="margin: 0; font-size: 15px; color: #856404; line-height: 1.5;">
                            <strong>Immediate Action Required:</strong> For your security, you must <strong>change your password</strong>. Please log in and navigate to your <strong>Profile Section</strong> to update your credentials.
                        </p>
                    </div>

                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                        Automated message from Cohort Management System. Please do not reply to this email.
                    </p>
                    <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                        Welcome aboard,<br>
                        <strong>Cohort Operations Team</strong>
                    </p>
                </div>
            </div>
          `
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
