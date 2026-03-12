import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';
import Workspace from '@/models/Workspace';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { getAuthUser, authResponse } from '@/lib/auth';
import { validateEmail, checkRequiredFields, validateMobile } from '@/utils/validation';
import sendEmail from '@/utils/sendEmail';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);

        let query = {};
        if (user && user.role !== 'Admin') {
            query = { email: user.email };
        }

        const requests = await BookingRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        const body = await req.json();

        const requiredFields = ['fullName', 'email', 'contactNumber', 'duration', 'startDate', 'workspaceId', 'workspaceName', 'paymentMethod'];
        const requiredError = checkRequiredFields(body, requiredFields);
        if (requiredError) {
            return NextResponse.json({ message: requiredError }, { status: 400 });
        }

        if (!validateEmail(body.email)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        if (body.contactNumber && !validateMobile(body.contactNumber)) {
            return NextResponse.json({ message: 'Invalid contact number format' }, { status: 400 });
        }

        const workspace = await Workspace.findById(body.workspaceId);
        if (!workspace) {
            return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
        }

        // Calculate duration months
        let durationMonths = 0;
        const durationStr = body.duration;
        const parts = durationStr.split(" ");
        const num = parseFloat(parts[0]);
        const unit = parts[1]?.toLowerCase() || 'months';

        if (unit.startsWith('year')) durationMonths = num * 12;
        else if (unit.startsWith('month')) durationMonths = num;
        else if (unit.startsWith('week')) durationMonths = num / 4.34;
        else if (unit.startsWith('day')) durationMonths = num / 30.44;
        else if (unit.startsWith('hour')) durationMonths = num / (30.44 * 24);

        const totalAmount = Math.ceil(workspace.price * durationMonths);
        const invoiceId = `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Calculate allotment dates
        const allotStart = new Date(body.startDate);
        const allotEnd = new Date(allotStart);
        if (unit.startsWith('year')) allotEnd.setFullYear(allotEnd.getFullYear() + num);
        else if (unit.startsWith('month')) allotEnd.setMonth(allotEnd.getMonth() + num);
        else if (unit.startsWith('week')) allotEnd.setDate(allotEnd.getDate() + num * 7);
        else if (unit.startsWith('day')) allotEnd.setDate(allotEnd.getDate() + num);
        else if (unit.startsWith('hour')) allotEnd.setHours(allotEnd.getHours() + num);

        const isPayNow = body.paymentMethod === 'Pay Now';

        const bookingData = {
            ...body,
            totalAmount,
            invoiceId,
            paymentStatus: isPayNow ? 'Paid' : 'Pending',
            status: isPayNow ? 'Confirmed' : 'Awaiting Payment'
        };

        const createdBooking = await BookingRequest.create(bookingData);

        // ── Auto Allotment ──────────────────────────────────────────────────────
        // If Pay Now: assign workspace to the logged-in user OR, for unregistered
        // guests, fall back to the Admin account so the workspace is visibly held
        // and the admin can transfer it once the member registers.
        if (isPayNow) {
            let bookingUserId = user?._id;

            if (!bookingUserId) {
                // Try to find a registered user with this email
                const foundUser = await User.findOne({ email: body.email });
                bookingUserId = foundUser?._id;
            }

            if (!bookingUserId) {
                // Unregistered guest → assign to Admin as placeholder
                const adminUser = await User.findOne({ role: 'Admin' });
                bookingUserId = adminUser?._id;
            }

            if (bookingUserId) {
                await Workspace.findByIdAndUpdate(body.workspaceId, {
                    allottedTo: bookingUserId,
                    allotmentStart: allotStart,
                    allotmentEnd: allotEnd
                });
            }
        }

        // ── Create Invoice ──────────────────────────────────────────────────────
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const invoiceData: any = {
            invoiceNumber: invoiceId,
            bookingId: createdBooking._id,
            userId: user?._id || null,
            customerName: body.fullName,
            customerEmail: body.email,
            workspaceName: body.workspaceName,
            amount: totalAmount,
            paymentMethod: body.paymentMethod,
            status: bookingData.paymentStatus,
            dueDate: dueDate,
            paidDate: isPayNow ? new Date() : undefined
        };

        if (!invoiceData.userId) {
            const foundUser = await User.findOne({ email: body.email });
            if (foundUser) {
                invoiceData.userId = foundUser._id;
            } else {
                // Unregistered guest → use Admin as placeholder so the required
                // userId field on Invoice is always satisfied.
                const adminUser = await User.findOne({ role: 'Admin' });
                if (adminUser) invoiceData.userId = adminUser._id;
            }
        }

        const createdInvoice = await Invoice.create(invoiceData);

        // ── Notify Admin ────────────────────────────────────────────────────────
        // Always notify admin on Pay Now bookings (especially unregistered guests)
        if (isPayNow) {
            try {
                const adminUser = await User.findOne({ role: 'Admin' });
                const adminEmail = adminUser?.email || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

                if (adminEmail) {
                    const isGuest = !user && !(await User.findOne({ email: body.email }));
                    const startDateStr = new Date(body.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });
                    const endDateStr = allotEnd.toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });

                    await sendEmail({
                        email: adminEmail,
                        subject: `🔔 New ${isGuest ? 'Guest ' : ''}Booking — ${body.workspaceName} (Pay Now)`,
                        message: `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:640px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:12px;">
  <div style="background:#0f4c3a;padding:28px 32px;border-radius:10px 10px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">COHORT ECOSYSTEM</h1>
    <p style="color:#a7f3d0;margin:6px 0 0;font-size:13px;">Admin Booking Notification</p>
  </div>
  <div style="background:#fff;padding:36px 32px;border-radius:0 0 10px 10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    ${isGuest ? `
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:6px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">⚠️ Unregistered Guest Booking</p>
      <p style="margin:6px 0 0;font-size:13px;color:#78350f;">This booking was placed by a visitor who is not registered in the system. The workspace has been temporarily assigned to the Admin account. Please follow up and transfer it once the user registers.</p>
    </div>` : ''}
    <h2 style="color:#0f4c3a;margin:0 0 20px;font-size:18px;">New Confirmed Booking</h2>

    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
      <tr style="background:#f0fdf4;">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;width:38%;">Workspace</td>
        <td style="padding:10px 14px;font-weight:600;">${body.workspaceName}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Customer</td>
        <td style="padding:10px 14px;font-weight:600;">${body.fullName}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Email</td>
        <td style="padding:10px 14px;">${body.email}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Contact</td>
        <td style="padding:10px 14px;">${body.contactNumber}</td>
      </tr>
      ${body.firmName ? `<tr style="background:#f0fdf4;">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Firm</td>
        <td style="padding:10px 14px;">${body.firmName}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Duration</td>
        <td style="padding:10px 14px;">${body.duration}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">From</td>
        <td style="padding:10px 14px;">${startDateStr}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">To</td>
        <td style="padding:10px 14px;">${endDateStr}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Amount Paid</td>
        <td style="padding:10px 14px;font-weight:700;color:#059669;font-size:16px;">₹${totalAmount.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Invoice ID</td>
        <td style="padding:10px 14px;font-family:monospace;font-weight:700;">${invoiceId}</td>
      </tr>
    </table>

    <div style="margin-top:28px;padding:16px 20px;background:#ecfdf5;border-radius:8px;border:1px solid #6ee7b7;display:flex;align-items:center;">
      <span style="font-size:18px;margin-right:10px;">✅</span>
      <span style="font-size:14px;color:#065f46;font-weight:600;">Payment confirmed. Workspace has been ${isGuest ? 'temporarily assigned to Admin' : 'allotted to the member'}.</span>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:16px;">
      Automated notification from Cohort Management System · Do not reply
    </p>
  </div>
</div>`,
                    });
                }
            } catch (emailError) {
                // Non-fatal: log and continue
                console.error('Admin notification email failed:', emailError);
            }
        }

        // ── Confirmation email to the user ─────────────────────────────────────
        if (isPayNow) {
            try {
                const startDateStr = new Date(body.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                await sendEmail({
                    email: body.email,
                    subject: `✅ Booking Confirmed — ${body.workspaceName}`,
                    message: `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:12px;">
  <div style="background:#0f4c3a;padding:28px 32px;border-radius:10px 10px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">COHORT ECOSYSTEM</h1>
  </div>
  <div style="background:#fff;padding:36px 32px;border-radius:0 0 10px 10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    <h2 style="color:#0f4c3a;margin:0 0 8px;">Booking Confirmed!</h2>
    <p style="color:#4b5563;font-size:15px;margin:0 0 24px;">Hi ${body.fullName}, your workspace has been successfully booked.</p>
    
    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Booking Summary</p>
      <p style="margin:6px 0;font-size:15px;font-weight:700;color:#111827;">${body.workspaceName}</p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Starting: <strong>${startDateStr}</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Duration: <strong>${body.duration}</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#059669;font-weight:700;">Amount Paid: ₹${totalAmount.toLocaleString('en-IN')}</p>
      <p style="margin:4px 0;font-size:13px;color:#6b7280;font-family:monospace;">Invoice: ${invoiceId}</p>
    </div>

    <p style="color:#4b5563;font-size:14px;">Our team will be in touch if any additional information is needed. You can log into your dashboard to track your booking status.</p>
    
    <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:16px;">
      Automated message from Cohort Management System · Do not reply<br>
      <strong>Cohort Operations Team</strong>
    </p>
  </div>
</div>`,
                });
            } catch (emailError) {
                console.error('User confirmation email failed:', emailError);
            }
        }

        return NextResponse.json({
            booking: createdBooking,
            invoice: createdInvoice
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
