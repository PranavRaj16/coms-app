import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './db';
import User from '@/models/User';

export async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const urlToken = req.nextUrl.searchParams.get('token');
    
    // Debug logging for troubleshooting download issues
    console.log(`[AUTH] Header: ${authHeader ? 'Present' : 'Missing'}, URL Token: ${urlToken ? 'Present' : 'Missing'}`);

    const token = (authHeader && authHeader.startsWith('Bearer ')) 
        ? authHeader.split(' ')[1] 
        : urlToken;

    if (!token || token === 'null' || token === 'undefined') {
        return null;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        await connectDB();
        const user = await User.findById(decoded.id).select('-password');
        if (user) console.log(`[AUTH] Success as ${user.email} (${user.role})`);
        return user;
    } catch (error: any) {
        console.error(`[AUTH] Token verification failed: ${error.message}`);
        return null;
    }
}

export function authResponse(message: string, status: number = 401) {
    return NextResponse.json({ message }, { status });
}
