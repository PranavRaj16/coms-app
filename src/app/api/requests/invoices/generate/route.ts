import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import BookingRequest from '@/models/BookingRequest';
import { getAuthUser } from '@/lib/auth';

// POST /api/requests/invoices/generate
// Admin triggers this to generate invoices for the current month for all allotted dedicated workspaces
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Find all dedicated/private workspaces that are currently allotted
        // We include common variants of dedicated workspaces, using case-insensitive search
        const allottedWorkspaces = await Workspace.find({
            type: { 
                $in: [
                    /dedicated/i, 
                    /private/i,
                    /cabin/i,
                    /desk/i,
                    /office/i
                ] 
            },
            allottedTo: { $ne: null },
        }).populate('allottedTo');

        console.log(`[GENERATE] Found ${allottedWorkspaces.length} allotted dedicated workspaces`);

        // Group workspaces by user to generate one combined invoice per member
        const userWorkspaces = new Map<string, any[]>();
        for (const ws of allottedWorkspaces) {
            const memberId = (ws.allottedTo as any)?._id?.toString();
            const memberEmail = (ws.allottedTo as any)?.email;

            if (!memberId || !memberEmail) {
                console.log(`[GENERATE] Workspace ${ws.name} has no valid populated user (ID: ${memberId}, Email: ${memberEmail})`);
                continue;
            }
            
            if (!userWorkspaces.has(memberId)) {
                userWorkspaces.set(memberId, []);
            }
            userWorkspaces.get(memberId)!.push(ws);
        }

        console.log(`[GENERATE] Grouped into ${userWorkspaces.size} unique members`);

        const results = { 
            generated: 0, 
            skippedCount: 0, 
            alreadyInvoiced: 0,
            notActiveCount: 0,
            errors: [] as string[] 
        };

        for (const [memberId, wsList] of userWorkspaces.entries()) {
            try {
                const member = wsList[0].allottedTo as any;
                
                // Track workspaces that need an invoice this month
                const billableWorkspaces = [];
                
                for (const ws of wsList) {
                    // 1. Check if the allotment is currently active
                    if (ws.unavailableUntil && new Date(ws.unavailableUntil) < now) {
                        console.log(`[GENERATE] Workspace ${ws.name} skipped: unavailableUntil ${ws.unavailableUntil} is in the past`);
                        results.notActiveCount++;
                        continue;
                    }
                    if (ws.allotmentStart && new Date(ws.allotmentStart) > now) {
                        console.log(`[GENERATE] Workspace ${ws.name} skipped: allotmentStart ${ws.allotmentStart} is in the future`);
                        results.notActiveCount++;
                        continue;
                    }
                    
                    billableWorkspaces.push(ws);
                }

                if (billableWorkspaces.length === 0) {
                    continue;
                }

                // 2. Check if a recurring invoice already exists for this user and month
                const existing = await Invoice.findOne({
                    userId: member._id,
                    billingMonth,
                    type: 'recurring',
                });
                
                if (existing) {
                    console.log(`[GENERATE] User ${member.email} already has invoice for ${billingMonth}`);
                    results.alreadyInvoiced += billableWorkspaces.length;
                    continue;
                }

                const totalAmount = billableWorkspaces.reduce((sum, ws) => sum + (ws.price || 0), 0);
                const workspaceNames = billableWorkspaces.map(ws => ws.name).join(', ');
                const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);
                
                // Unique invoice number per user per month
                const invoiceNumber = `INV-REC-${billingMonth}-${String(member._id).slice(-5).toUpperCase()}`;

                await Invoice.create({
                    invoiceNumber,
                    workspaceId: billableWorkspaces[0]._id, // Reference the first one as primary
                    userId: member._id,
                    customerName: member.name,
                    customerEmail: member.email,
                    workspaceName: workspaceNames,
                    amount: totalAmount,
                    paymentMethod: 'Monthly',
                    status: 'Pending',
                    type: 'recurring',
                    billingMonth,
                    dueDate,
                });

                console.log(`[GENERATE] Created invoice ${invoiceNumber} for ${member.email}`);
                results.generated++;
            } catch (err: any) {
                console.error(`[GENERATE] Error for member ${memberId}:`, err);
                results.errors.push(`User ${memberId}: ${err.message}`);
            }
        }

        const monthName = now.toLocaleString('default', { month: 'long' });
        return NextResponse.json({
            message: `Invoice generation summary for ${monthName}: ${results.generated} created, ${results.alreadyInvoiced} already exist, ${results.notActiveCount} not active.`,
            ...results,
        });
    } catch (error: any) {
        console.error('[GENERATE] Critical error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
