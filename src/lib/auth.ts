import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './db';
import User from '@/models/User';

export async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        await connectDB();
        const user = await User.findById(decoded.id).select('-password');
        return user;
    } catch (error) {
        return null;
    }
}

export function authResponse(message: string, status: number = 401) {
    return NextResponse.json({ message }, { status });
}
