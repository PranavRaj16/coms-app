import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import sendEmail from '@/utils/sendEmail';

export async function processMonthlyInvoices(targetDate?: Date) {
    await connectDB();

    const now = new Date();
    // Default logic: If no target date provided and we are in April (Month 3), 
    // target March (Month 2). Otherwise use current date.
    let referenceDate = targetDate;
    if (!referenceDate) {
        // Default logic: Target the previous calendar month
        // e.g., If current date is June 1st, we generate for May
        referenceDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        console.log(`[INVOICE_SERVICE] No target date provided. Auto-targeting previous month: ${referenceDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`);
    }

    const billingMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;
    const billingMonthLabel = referenceDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    // Import BookingRequest models
    const BookingRequest = (await import('@/models/BookingRequest')).default;

    const results = {
        generated: 0,
        alreadyInvoiced: 0,
        billingMonthLabel,
        errors: [] as string[]
    };

    // ─── 1. HANDLE DEDICATED WORKSPACES (VIA WORKSPACE ALLOTMENT) ───────────
    // These are workspaces manually allotted to a user by the Admin
    const allottedWorkspaces = await Workspace.find({
        allottedTo: { $ne: null },
        $or: [
            { paymentMethod: { $in: ['Pay Monthly', 'Pay Montly', 'Monthly Payment', 'Monthly'] } },
            { paymentMethod: null } // Default to monthly if not specified for allotted workspaces
        ]
    }).populate('allottedTo');

    console.log(`[INVOICE_SERVICE] Found ${allottedWorkspaces.length} allotted dedicated workspaces`);

    for (const workspace of allottedWorkspaces) {
        try {
            const user = workspace.allottedTo as any;
            if (!user || user.role === 'Admin') continue; // Skip if no user or placeholder admin

            // Check if already invoiced for this workspace and month
            const existing = await Invoice.findOne({
                workspaceId: workspace._id,
                billingMonth,
                type: 'recurring',
            });

            if (existing) {
                results.alreadyInvoiced++;
                continue;
            }

            // Calculate Charges
            const workspaceSubtotal = (workspace.price || 0);
            const isCarParkingIncluded = !!user.includeCarParking;
            const carParkingSlots = isCarParkingIncluded ? (user.carParkingSlots || 0) : 0;
            const carParkingPricePerSlot = isCarParkingIncluded ? (user.carParkingPricePerSlot || 0) : 0;
            const carParkingAmount = carParkingSlots * carParkingPricePerSlot;
            const subtotal = workspaceSubtotal + carParkingAmount;
            
            const isGSTIncluded = !!user.includeGST;
            const gstAmount = isGSTIncluded ? Math.round(subtotal * 0.18) : 0;
            const amount = subtotal + gstAmount;

            const dueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 10); 
            const invoiceNumber = `INV-REC-${billingMonth}-${String(workspace._id).slice(-5).toUpperCase()}`;

            const invoice = await Invoice.create({
                invoiceNumber,
                workspaceId: workspace._id,
                userId: user._id,
                customerName: user.name,
                customerEmail: user.email,
                workspaceName: workspace.name,
                amount,
                subtotal,
                gstAmount,
                isGSTIncluded,
                carParkingAmount,
                carParkingSlots,
                carParkingPricePerSlot,
                paymentMethod: 'Pay Monthly',
                status: 'Pending',
                type: 'recurring',
                billingMonth,
                dueDate,
            });

            results.generated++;
            await sendInvoiceEmail(invoice, user, workspace, billingMonthLabel, dueDate, workspaceSubtotal);

        } catch (err: any) {
            results.errors.push(`Workspace ${workspace._id}: ${err.message}`);
        }
    }

    // ─── 2. HANDLE OPEN WORKSTATIONS (VIA BOOKING REQUESTS) ───────────────
    // Open workstations allows multiple users per workspace via bookings
    const openWorkstationBookings = await BookingRequest.find({
        paymentMethod: { $in: ['Pay Monthly', 'Pay Montly', 'Monthly Payment', 'Monthly'] },
        status: 'Confirmed'
    });

    // Check if any of these bookings are for Open WorkStations
    for (const booking of openWorkstationBookings) {
        try {
            const workspace = await Workspace.findById(booking.workspaceId);
            if (!workspace || workspace.type !== "Open WorkStation") continue; 

            const user = await User.findOne({ email: booking.email });
            if (!user) continue;

            const existing = await Invoice.findOne({
                bookingId: booking._id,
                billingMonth,
                type: 'recurring',
            });

            if (existing) {
                results.alreadyInvoiced++;
                continue;
            }

            const workspaceSubtotal = (workspace.price || 0) * (booking.seatCount || 1);
            const isCarParkingIncluded = !!user.includeCarParking;
            const carParkingSlots = isCarParkingIncluded ? (user.carParkingSlots || 0) : 0;
            const carParkingPricePerSlot = isCarParkingIncluded ? (user.carParkingPricePerSlot || 0) : 0;
            const carParkingAmount = carParkingSlots * carParkingPricePerSlot;
            const subtotal = workspaceSubtotal + carParkingAmount;
            
            const isGSTIncluded = !!user.includeGST;
            const gstAmount = isGSTIncluded ? Math.round(subtotal * 0.18) : 0;
            const amount = subtotal + gstAmount;

            const dueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 10); 
            const invoiceNumber = `INV-REC-${billingMonth}-${String(booking._id).slice(-5).toUpperCase()}`;

            const invoice = await Invoice.create({
                invoiceNumber,
                bookingId: booking._id,
                workspaceId: workspace._id,
                userId: user._id,
                customerName: user.name,
                customerEmail: user.email,
                workspaceName: workspace.name,
                amount,
                subtotal,
                gstAmount,
                isGSTIncluded,
                carParkingAmount,
                carParkingSlots,
                carParkingPricePerSlot,
                paymentMethod: 'Pay Monthly',
                status: 'Pending',
                type: 'recurring',
                billingMonth,
                dueDate,
            });

            results.generated++;
            await sendInvoiceEmail(invoice, user, workspace, billingMonthLabel, dueDate, workspaceSubtotal);

        } catch (err: any) {
            results.errors.push(`Booking ${booking._id}: ${err.message}`);
        }
    }

    return results;
}

// ─── HELPER: EMAIL SENDER ───────────────────────────────────────────────────
export async function sendInvoiceEmail(invoice: any, user: any, workspace: any, billingMonthLabel: string, dueDate: Date, workspaceSubtotal: number) {
    try {
        const formatCurrency = (n: number) =>
            `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const lineItems = [
            {
                label: `${workspace.name} — ${formatCurrency(workspace.price || 0)}`,
                amount: formatCurrency(workspaceSubtotal)
            },
            ...(invoice.carParkingAmount > 0
                ? [{
                    label: `Car Parking — ${invoice.carParkingSlots} slot(s) × ${formatCurrency(invoice.carParkingPricePerSlot)}`,
                    amount: formatCurrency(invoice.carParkingAmount)
                }]
                : []),
            ...(invoice.isGSTIncluded
                ? [{
                    label: `GST (18%)`,
                    amount: formatCurrency(invoice.gstAmount)
                }]
                : [])
        ];

        let billingPeriodHtml = '';
        if (invoice.billingMonth) {
            const [year, month] = invoice.billingMonth.split('-').map(Number);
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            const f = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            billingPeriodHtml = `
                <div style="margin-bottom: 20px; padding: 12px; background: #f0f4f8; border-radius: 8px; border-left: 4px solid #2A8778;">
                    <p style="margin: 0; font-size: 11px; color: #666; text-transform: uppercase; font-weight: bold;">Billing Period</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #333; font-weight: 600;">${f(firstDay)} to ${f(lastDay)}</p>
                </div>
            `;
        }

        const lineItemsHtml = lineItems.map(item => `
            <tr>
                <td style="padding: 12px 16px; color: #555; font-size: 14px;">${item.label}</td>
                <td style="padding: 12px 16px; text-align: right; color: #333; font-weight: 600; font-size: 14px;">${item.amount}</td>
            </tr>
        `).join('');

        const subject = invoice.status === 'Paid' 
            ? `PAID Receipt: ${invoice.invoiceNumber} — ${billingMonthLabel}`
            : `Invoice ${invoice.invoiceNumber} — ${billingMonthLabel}`;

        await sendEmail({
            email: user.email,
            subject: subject,
            message: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @media only screen and (max-width: 600px) {
                            .email-container { width: 100% !important; padding: 10px !important; }
                            .content-body { padding: 25px 20px !important; }
                            .header-meta td { display: block !important; width: 100% !important; text-align: left !important; margin-bottom: 15px; }
                            .total-box td { display: block !important; width: 100% !important; text-align: left !important; }
                            .total-amount { text-align: left !important; font-size: 32px !important; margin-top: 10px !important; }
                            .branding-h1 { font-size: 18px !important; letter-spacing: 2px !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f6f8;">
                    <div class="email-container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px;">
                        
                        <!-- Branding Header -->
                        <div style="background-color: #000000; padding: 35px 20px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 class="branding-h1" style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;">COHORT ECOSYSTEM</h1>
                        </div>

                        <!-- Main Content Body -->
                        <div class="content-body" style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                            
                            <!-- Header Meta Table -->
                            <table class="header-meta" style="width: 100%; border-bottom: 2px dashed #eceff1; margin-bottom: 30px; padding-bottom: 25px; border-spacing: 0;">
                                <tr>
                                    <td style="vertical-align: top; padding: 0;">
                                        <p style="margin: 0; font-size: 10px; color: #b0bec5; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Invoice Number</p>
                                        <p style="margin: 6px 0 0; font-size: 15px; font-weight: 700; color: #263238;">${invoice.invoiceNumber}</p>
                                    </td>
                                    <td style="text-align: right; vertical-align: top; padding: 0;">
                                        <p style="margin: 0; font-size: 10px; color: #b0bec5; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Payment Status</p>
                                        <p style="margin: 6px 0 0; font-size: 13px; font-weight: 800; color: ${invoice.status === 'Paid' ? '#2e7d32' : '#f57c00'}; text-transform: uppercase; background: ${invoice.status === 'Paid' ? '#e8f5e9' : '#fff3e0'}; padding: 4px 12px; border-radius: 6px; display: inline-block;">
                                            ${invoice.status || 'Pending'}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Entity Info -->
                            <div style="margin-bottom: 30px;">
                                <p style="margin: 0; font-size: 10px; color: #b0bec5; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Billed To</p>
                                <p style="margin: 8px 0 4px; font-size: 18px; font-weight: 700; color: #263238;">${user.name}</p>
                                <p style="margin: 0; font-size: 14px; color: #78909c;">${user.email}</p>
                            </div>

                            ${billingPeriodHtml}

                            <!-- Line Items Table -->
                            <div style="background: #fafafa; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #f0f0f0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: #f5f5f5;">
                                            <th style="padding: 15px 20px; text-align: left; font-size: 11px; color: #90a4ae; text-transform: uppercase; font-weight: 800;">Service Provision</th>
                                            <th style="padding: 15px 20px; text-align: right; font-size: 11px; color: #90a4ae; text-transform: uppercase; font-weight: 800;">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${lineItemsHtml}
                                    </tbody>
                                </table>
                            </div>

                            <!-- Grand Total Footer -->
                            <div style="background: #000000; color: #ffffff; border-radius: 16px; padding: 25px 30px; margin-bottom: 35px;">
                                <table class="total-box" style="width: 100%; border-spacing: 0;">
                                    <tr>
                                        <td style="font-size: 14px; font-weight: 600; color: #cfd8dc; padding: 0; vertical-align: middle;">
                                            Total Amount <span style="font-size: 11px; opacity: 0.7; display: block; margin-top: 4px;">Cycle: ${billingMonthLabel}</span>
                                        </td>
                                        <td class="total-amount" style="text-align: right; font-size: 26px; font-weight: 900; letter-spacing: -1px; padding: 0; vertical-align: middle;">
                                            ${formatCurrency(invoice.amount)}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Footer Sign-off -->
                            <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center;">
                                <p style="color: #90a4ae; font-size: 12px; margin: 0; line-height: 1.6;">
                                    This is an automated notification from Cohort Management System.<br>
                                    Please do not reply to this email. For support, contact operations.<br>
                                    <strong style="color: #263238; display: block; margin-top: 10px;">Cohort Operations Team</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
    } catch (err: any) {
        console.error(`[INVOICE_SERVICE] Email error to ${user.email}:`, err.message);
    }
}
