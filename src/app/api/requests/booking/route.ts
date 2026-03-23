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

        const isOpenWorkstation = workspace.type === "Open WorkStation";
        const seatCount = body.seatCount || 1;

        if (isOpenWorkstation && workspace.availableSeats < seatCount) {
            return NextResponse.json({ message: `Only ${workspace.availableSeats} seats available in this workspace.` }, { status: 400 });
        }

        const pricePerUnit = isOpenWorkstation ? workspace.price : workspace.price; // Both use price as base, but logic differs later
        const totalAmount = Math.ceil((workspace.price * (isOpenWorkstation ? seatCount : 1)) * durationMonths);
        const invoiceId = `INV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Calculate allotment dates
        const allotStart = new Date(body.startDate);
        let allotEnd: Date;
        
        if (body.endDate) {
            allotEnd = new Date(body.endDate);
        } else {
            allotEnd = new Date(allotStart);
            if (unit.startsWith('year')) allotEnd.setFullYear(allotEnd.getFullYear() + num);
            else if (unit.startsWith('month')) allotEnd.setMonth(allotEnd.getMonth() + num);
            else if (unit.startsWith('week')) allotEnd.setDate(allotEnd.getDate() + num * 7);
            else if (unit.startsWith('day')) allotEnd.setDate(allotEnd.getDate() + num);
            else if (unit.startsWith('hour')) allotEnd.setHours(allotEnd.getHours() + num);
        }

        const isPayNow = body.paymentMethod === 'Pay Now';
        const isMonthly = body.paymentMethod === 'Pay Monthly' || body.paymentMethod === 'Pay Montly';

        // ── Identify Booking User ────────────────────────────────────────────────
        // Assign to logged-in user, registered user with this email, or Admin guest placeholder
        let bookingUserId = user?._id;
        if (!bookingUserId) {
            const foundUser = await User.findOne({ email: body.email });
            bookingUserId = foundUser?._id;
        }
        if (!bookingUserId) {
            const adminUser = await User.findOne({ role: 'Admin' });
            bookingUserId = adminUser?._id;
        }

        const bookingData = {
            ...body,
            userId: bookingUserId,
            totalAmount,
            invoiceId,
            seatCount: isOpenWorkstation ? seatCount : 1,
            paymentStatus: isPayNow ? 'Paid' : 'Pending',
            status: isPayNow ? 'Confirmed' : (isMonthly ? 'Confirmed' : 'Awaiting Payment'),
            endDate: allotEnd
        };

        const createdBooking = await BookingRequest.create(bookingData);

        // ── Auto Allotment ──────────────────────────────────────────────────────
        if (bookingUserId) {
            const updateData: any = {
                allotmentStart: allotStart,
                allotmentEnd: allotEnd,
                paymentMethod: body.paymentMethod
            };

            if (isOpenWorkstation) {
                // For Open Workstations, we decrement available seats instead of full allotment
                updateData.$inc = { availableSeats: -seatCount };
                // Also set allottedTo for the first user if it's currently null, 
                // but for Open Workstations we usually keep it null to allow multiple.
                // However, the user wants "booking should be allocated to user".
                // We've already handled this in the dashboard fetchers by looking at BookingRequest.
            } else {
                updateData.allottedTo = bookingUserId;
            }

            await Workspace.findByIdAndUpdate(body.workspaceId, updateData);
        }

        // ── Create Invoice ──────────────────────────────────────────────────────
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        // For Pay Monthly, the initial invoice is only for the first month
        const invoiceAmount = isMonthly 
            ? Math.ceil(workspace.price * (isOpenWorkstation ? seatCount : 1))
            : totalAmount;

        const invoiceData: any = {
            invoiceNumber: invoiceId,
            bookingId: createdBooking._id,
            workspaceId: body.workspaceId,
            userId: user?._id || null,
            customerName: body.fullName,
            customerEmail: body.email,
            workspaceName: body.workspaceName,
            amount: invoiceAmount,
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
                const adminUser = await User.findOne({ role: 'Admin' });
                if (adminUser) invoiceData.userId = adminUser._id;
            }
        }

        const createdInvoice = await Invoice.create(invoiceData);

        // ── Notify Admin ────────────────────────────────────────────────────────
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
                    subject: `🔔 New ${isGuest ? 'Guest ' : ''}Booking — ${body.workspaceName} (${body.paymentMethod})`,
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
    <h2 style="color:#0f4c3a;margin:0 0 20px;font-size:18px;">Booking ${isPayNow ? 'Confirmed' : 'Requested (Pay Later)'}</h2>

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
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Total Amount</td>
        <td style="padding:10px 14px;font-weight:700;color:#059669;font-size:16px;">₹${totalAmount.toLocaleString('en-IN')} ${isPayNow ? '(Paid)' : '(Pending)'}</td>
      </tr>
      ${isOpenWorkstation ? `
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Seats Booked</td>
        <td style="padding:10px 14px;font-weight:600;">${seatCount} Seats</td>
      </tr>` : ''}
      <tr style="${isOpenWorkstation ? 'background:#f0fdf4;' : ''}">
        <td style="padding:10px 14px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Invoice ID</td>
        <td style="padding:10px 14px;font-family:monospace;font-weight:700;">${invoiceId}</td>
      </tr>
    </table>

    <div style="margin-top:28px;padding:16px 20px;background:#ecfdf5;border-radius:8px;border:1px solid #6ee7b7;display:flex;align-items:center;">
      <span style="font-size:18px;margin-right:10px;">${isPayNow ? '✅' : '⏳'}</span>
      <span style="font-size:14px;color:#065f46;font-weight:600;">Workspace has been reserved and ${isGuest ? 'temporarily assigned to Admin' : 'allotted to the member'}. ${isPayNow ? 'Payment received.' : 'Awaiting payment via Pay Later.'}</span>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:16px;">
      Automated notification from Cohort Management System · Do not reply
    </p>
  </div>
</div>`,
                });
            }
        } catch (emailError) {
            console.error('Admin notification email failed:', emailError);
        }

        // ── Confirmation email to the user ─────────────────────────────────────
        try {
            const startDateStr = new Date(body.startDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            await sendEmail({
                email: body.email,
                subject: `${isPayNow ? '✅ Booking Confirmed' : '📝 Booking Request Received'} — ${body.workspaceName}`,
                message: `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:12px;">
  <div style="background:#0f4c3a;padding:28px 32px;border-radius:10px 10px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">COHORT ECOSYSTEM</h1>
  </div>
  <div style="background:#fff;padding:36px 32px;border-radius:0 0 10px 10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    <h2 style="color:#0f4c3a;margin:0 0 8px;">${isPayNow ? 'Booking Confirmed!' : 'Booking Request Received!'}</h2>
    <p style="color:#4b5563;font-size:15px;margin:0 0 24px;">Hi ${body.fullName}, your booking for ${body.workspaceName} has been ${isPayNow ? 'successfully confirmed' : 'received and the space is reserved for you'}.</p>
    
    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Booking Details</p>
      <p style="margin:6px 0;font-size:15px;font-weight:700;color:#111827;">${body.workspaceName}</p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Starting: <strong>${startDateStr}</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#374151;">Duration: <strong>${body.duration}</strong>${isOpenWorkstation ? ` (${seatCount} Seats)` : ''}</p>
      <p style="margin:4px 0;font-size:14px;color:${isPayNow ? '#059669' : '#d97706'};font-weight:700;">Status: ${isPayNow ? 'Paid Online' : 'Pay Later (Pending)'}</p>
      <p style="margin:4px 0;font-size:14px;color:#374151;font-weight:700;">Total Amount: ₹${totalAmount.toLocaleString('en-IN')}</p>
      <p style="margin:4px 0;font-size:13px;color:#6b7280;font-family:monospace;">Invoice: ${invoiceId}</p>
    </div>

    <p style="color:#4b5563;font-size:14px;">${isPayNow ? 'Our team will be in touch if any additional information is needed.' : 'Please ensure payment is completed within 24 hours to finalize your booking.'} You can log into your dashboard to track your booking status.</p>
    
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

        return NextResponse.json({
            booking: createdBooking,
            invoice: createdInvoice
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
