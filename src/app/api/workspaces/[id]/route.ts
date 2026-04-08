import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const workspace = await Workspace.findById(id);
        if (!workspace) return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') return authResponse('Not authorized', 403);

        const { id } = await params;
        const data = await req.json();
        
        // Find existing workspace to compare changes
        const oldWorkspace = await Workspace.findById(id);
        if (!oldWorkspace) return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });

        const workspace = await Workspace.findByIdAndUpdate(id, data, { new: true });

        // Check if allottedTo has been changed to a new user
        if (data.allottedTo && data.allottedTo !== String(oldWorkspace.allottedTo)) {
            const User = (await import('@/models/User')).default;
            const sendEmail = (await import('@/utils/sendEmail')).default;
            
            const targetUser = await User.findById(data.allottedTo);
            if (targetUser) {
                const startStr = data.allotmentStart ? new Date(data.allotmentStart).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Immediate';
                
                const endStr = data.unavailableUntil ? new Date(data.unavailableUntil).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Long-term';

                try {
                    await sendEmail({
                        email: targetUser.email,
                        subject: `✅ Workspace Confirmed — ${workspace.name}`,
                        message: `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:12px;">
  <div style="background:#0f4c3a;padding:32px 32px;border-radius:10px 10px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">COHORT ECOSYSTEM</h1>
  </div>
  <div style="background:#fff;padding:36px 32px;border-radius:0 0 10px 10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    <h2 style="color:#0f4c3a;margin:0 0 8px;">Booking Confirmed!</h2>
    <p style="color:#4b5563;font-size:15px;margin:0 0 24px;">Hi ${targetUser.name}, we are pleased to inform you that the workspace <strong>${workspace.name}</strong> has been successfully allotted to you by the administrator.</p>
    
    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Workspace Details</p>
      <p style="margin:6px 0;font-size:16px;font-weight:700;color:#111827;">${workspace.name}</p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Location: <strong>${workspace.location} (${workspace.floor})</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Type: <strong>${workspace.type}</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Price: <strong>₹${Number(workspace.price).toLocaleString('en-IN')} / month</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Period: <strong>${startStr} to ${endStr}</strong></p>
    </div>

    <p style="color:#4b5563;font-size:14px;">You can now access your dashboard to view complete details, agreements, and track your invoices. We look forward to seeing you at our community!</p>
    
    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Automated message from Cohort Management System · Do not reply<br>
        <strong>Cohort Operations Team</strong>
      </p>
    </div>
  </div>
</div>`
                    });
                } catch (emailError) {
                    console.error('Failed to send allotment confirmation email:', emailError);
                }
            }
        }

        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') return authResponse('Not authorized', 403);

        const { id } = await params;
        await Workspace.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Workspace deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
