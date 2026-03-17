import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Workspace from '@/models/Workspace';
import User from '@/models/User';

export async function processMonthlyInvoices() {
    await connectDB();
    
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const BookingRequest = (await import('@/models/BookingRequest')).default;

    // Find all active bookings with any variation of Pay Monthly
    const activeBookings = await BookingRequest.find({
        paymentMethod: { $in: ['Pay Monthly', 'Pay Montly', 'Monthly Payment', 'Monthly'] },
        status: 'Confirmed',
        startDate: { $lte: now },
        $or: [
            { endDate: { $gte: now } },
            { endDate: null }
        ]
    });

    console.log(`[INVOICE_SERVICE] Found ${activeBookings.length} active monthly bookings`);

    const results = { 
        generated: 0, 
        alreadyInvoiced: 0,
        errors: [] as string[] 
    };

    for (const booking of activeBookings) {
        try {
            // Find the user for this booking
            const user = await User.findOne({ email: booking.email });
            if (!user) {
                results.errors.push(`Booking ${booking._id}: User not found for email ${booking.email}`);
                continue;
            }

            // Find the workspace to get current pricing
            const workspace = await Workspace.findById(booking.workspaceId);
            if (!workspace) {
                results.errors.push(`Booking ${booking._id}: Workspace ${booking.workspaceId} not found`);
                continue;
            }

            // Check if a recurring invoice already exists for this booking and month
            const existing = await Invoice.findOne({
                bookingId: booking._id,
                billingMonth,
                type: 'recurring',
            });
            
            if (existing) {
                results.alreadyInvoiced++;
                continue;
            }

            // Calculate amount: Workspace Price * Seat Count
            const monthlyPrice = (workspace.price || 0) * (booking.seatCount || 1);
            
            const dueDate = new Date(now.getFullYear(), now.getMonth(), 10); // Due on the 10th of the month
            const invoiceNumber = `INV-REC-${billingMonth}-${String(booking._id).slice(-5).toUpperCase()}`;

            await Invoice.create({
                invoiceNumber,
                bookingId: booking._id,
                workspaceId: workspace._id,
                userId: user._id,
                customerName: booking.fullName,
                customerEmail: booking.email,
                workspaceName: workspace.name,
                amount: monthlyPrice,
                paymentMethod: 'Pay Monthly',
                status: 'Pending',
                type: 'recurring',
                billingMonth,
                dueDate,
            });

            results.generated++;
        } catch (err: any) {
            results.errors.push(`Booking ${booking._id}: ${err.message}`);
        }
    }

    return results;
}
