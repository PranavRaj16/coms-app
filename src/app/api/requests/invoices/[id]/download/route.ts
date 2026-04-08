import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import PDFDocument from 'pdfkit';
import path from 'path';
import { getAuthUser, authResponse } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const user = await getAuthUser(req);
        if (!user) {
            return authResponse('Not authenticated', 401);
        }

        const invoice = await Invoice.findById(id).populate('workspaceId');
        if (!invoice) {
            return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
        }

        // Check authorization: Admin or the owner of the invoice
        if (user.role !== 'Admin' && invoice.userId.toString() !== user.id.toString()) {
            return authResponse('Not authorized to download this invoice', 403);
        }

        // PDF Generation
        const fontRegular = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og', 'noto-sans-v27-latin-regular.ttf');
        const fontBold = fontRegular; // Fallback

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            font: fontRegular
        });

        const buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));

        const pdfPromise = new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });

        // Colors & Config
        const colors = {
            primary: '#2A8778',
            secondary: '#134E48',
            slate: '#0F172A',
            muted: '#4B5563',
            lightMuted: '#9CA3AF',
            border: '#E5E7EB',
            bg: '#FFFFFF',
            cardBg: '#FAFAFA'
        };

        // --- REFINE PDF STYLING (MODERN CORPORATE) ---
        const pageWidth = 595;
        const pageHeight = 842;

        // Decorative Sidebar Bar
        doc.rect(0, 0, 15, pageHeight).fill(colors.primary);

        // Header
        doc.fillColor(colors.primary).fontSize(22).text('COHORT ECOSYSTEM', 50, 50, { characterSpacing: 2 });
        doc.fillColor(colors.muted).fontSize(10).text('OFFICIAL TAX INVOICE', 50, 75);

        // Right side info (Invoice number)
        doc.fillColor(colors.slate).fontSize(24).text('INVOICE', 0, 50, { align: 'right', width: pageWidth - 60 });
        doc.fillColor(colors.muted).fontSize(10).text(`#${invoice.invoiceNumber}`, 0, 80, { align: 'right', width: pageWidth - 60 });

        doc.moveTo(50, 110).lineTo(pageWidth - 50, 110).strokeColor(colors.border).lineWidth(1).stroke();

        // Billing Details Section
        const detailsY = 140;
        // Bill to
        doc.fillColor(colors.primary).fontSize(8).text('BILL TO:', 50, detailsY);
        doc.fillColor(colors.slate).fontSize(12).text(invoice.customerName, 50, detailsY + 15);
        doc.fillColor(colors.muted).fontSize(9).text(invoice.customerEmail, 50, detailsY + 30);

        // Workspace ref
        if (invoice.workspaceName) {
            doc.fillColor(colors.muted).fontSize(8).text('PROPERTY REF:', 50, detailsY + 50);
            doc.fillColor(colors.slate).fontSize(9).text(invoice.workspaceName, 50, detailsY + 62);
        }

        // Invoice Metadata
        const metaX = 400;
        doc.fillColor(colors.primary).fontSize(8).text('INVOICE DATE:', metaX, detailsY);
        doc.fillColor(colors.slate).fontSize(10).text(invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'), metaX, detailsY + 15);

        // Removed DUE DATE as requested

        doc.fillColor(colors.primary).fontSize(8).text('PAYMENT STATUS:', metaX, detailsY + 50);
        const statusColor = invoice.status === 'Paid' ? '#059669' : '#D97706';
        doc.fillColor(statusColor).fontSize(10).text(invoice.status.toUpperCase(), metaX, detailsY + 65);

        // --- Items Table ---
        const tableY = 240;
        doc.rect(50, tableY, pageWidth - 100, 30).fill(colors.slate);
        doc.fillColor('#FFFFFF').fontSize(9).text('DESCRIPTION', 70, tableY + 11, { characterSpacing: 1 });
        doc.text('AMOUNT (INR)', 0, tableY + 11, { align: 'right', width: pageWidth - 70, characterSpacing: 1 });

        // Financial Variables for Consistency
        const isGSTIncluded = !!invoice.isGSTIncluded;
        const totalAmount = Number(invoice.amount) || 0;
        const subtotalValue = invoice.subtotal || (isGSTIncluded ? Math.round(totalAmount / 1.18) : totalAmount);
        const gstValue = invoice.gstAmount || (isGSTIncluded ? totalAmount - subtotalValue : 0);
        const parkingAmount = Number(invoice.carParkingAmount) || 0;
        const workspaceBase = subtotalValue - parkingAmount;

        // Line Item 1: Workspace
        const row1Y = tableY + 45;
        doc.fillColor(colors.slate).fontSize(11).text(`${invoice.workspaceName} - Subscription`, 70, row1Y);

        let billingPeriodText = 'Service usage period';
        if (invoice.billingMonth) {
            const [year, month] = invoice.billingMonth.split('-').map(Number);
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            const f = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            billingPeriodText = `Cycle: ${f(firstDay)} to ${f(lastDay)}`;
        }
        doc.fillColor(colors.muted).fontSize(9).text(billingPeriodText, 70, row1Y + 15);

        doc.fillColor(colors.slate).fontSize(11).text(workspaceBase.toLocaleString('en-IN', { minimumFractionDigits: 0 }), 0, row1Y, { align: 'right', width: pageWidth - 70 });

        // Car Parking Row
        let nextRowY = row1Y + 45;
        if (parkingAmount > 0) {
            doc.fillColor(colors.slate).fontSize(11).text('Reserved Car Parking', 70, nextRowY);
            doc.fillColor(colors.muted).fontSize(9).text(`${invoice.carParkingSlots} slot(s) x INR ${invoice.carParkingPricePerSlot?.toLocaleString('en-IN')}`, 70, nextRowY + 15);
            doc.fillColor(colors.slate).fontSize(11).text(parkingAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 }), 0, nextRowY, { align: 'right', width: pageWidth - 70 });
            nextRowY += 45;
        }

        doc.moveTo(50, nextRowY).lineTo(pageWidth - 50, nextRowY).strokeColor(colors.border).lineWidth(0.5).stroke();

        // Totals Column
        let currentTotalY = nextRowY + 25;
        
        doc.fillColor(colors.muted).fontSize(9).text('WORKSPACE FEE:', 370, currentTotalY);
        doc.fillColor(colors.slate).fontSize(9).text(`${workspaceBase.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 0, currentTotalY, { align: 'right', width: pageWidth - 70 });
        currentTotalY += 18;

        if (parkingAmount > 0) {
            doc.fillColor(colors.muted).fontSize(9).text('PARKING FEE:', 370, currentTotalY);
            doc.fillColor(colors.slate).fontSize(9).text(`${parkingAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 0, currentTotalY, { align: 'right', width: pageWidth - 70 });
            currentTotalY += 18;
        }

        doc.moveTo(370, currentTotalY - 4).lineTo(pageWidth - 70, currentTotalY - 4).strokeColor(colors.border).lineWidth(0.5).stroke();

        doc.fillColor(colors.muted).fontSize(10).text('NET SUBTOTAL:', 370, currentTotalY);
        doc.fillColor(colors.slate).fontSize(10).text(`${subtotalValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 0, currentTotalY, { align: 'right', width: pageWidth - 70 });
        currentTotalY += 20;

        if (isGSTIncluded) {
            doc.fillColor(colors.muted).fontSize(10).text('GST (18%):', 370, currentTotalY);
            doc.fillColor(colors.slate).fontSize(10).text(`${gstValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 0, currentTotalY, { align: 'right', width: pageWidth - 70 });
            currentTotalY += 20;
        }

        // Grand Total Box - REFINED
        const boxWidth = 220;
        const boxX = pageWidth - 50 - boxWidth;
        const boxHeight = 50;
        const boxY = currentTotalY + 15;

        doc.rect(boxX, boxY, boxWidth, boxHeight).fill(colors.primary);
        doc.fillColor('#FFFFFF').fontSize(8).text('FINAL AMOUNT DUE (INR)', boxX + 15, boxY + 12, { characterSpacing: 1 });
        doc.fontSize(18).text(`${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, boxX, boxY + 24, { align: 'right', width: boxWidth - 15 });


        // Footer Note

        doc.end();

        const pdfBuffer = await pdfPromise;

        const isPreview = req.nextUrl.searchParams.get('preview') === 'true';

        return new Response(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': isPreview
                    ? `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`
                    : `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('Invoice Download Error:', error);
        return NextResponse.json({ message: error.message || 'Error downloading invoice' }, { status: 500 });
    }
}
