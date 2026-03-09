import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DayPass from '@/models/DayPass';
import sendEmail from '@/utils/sendEmail';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { getAuthUser, authResponse } from '@/lib/auth';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user || user.role !== 'Admin') {
            return authResponse('Not authorized as an admin', 403);
        }

        const passes = await DayPass.find({}).sort({ createdAt: -1 });
        return NextResponse.json(passes);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name, email, contact, purpose, visitDate } = await req.json();

        if (!name || !email || !contact || !purpose || !visitDate) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
        }

        const passCode = `COHORT-${uuidv4().substring(0, 8).toUpperCase()}`;

        const dayPass = await DayPass.create({
            name,
            email,
            contact,
            purpose,
            visitDate,
            passCode
        });

        // Generate QR Code
        const qrCodeData = await QRCode.toDataURL(passCode);

        // Use a valid TTF from node_modules with absolute path to avoid resolver issues
        const fontRegular = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og', 'noto-sans-v27-latin-regular.ttf');
        const fontBold = fontRegular; // Fallback to same font for bold if no other ttf is found

        // Generate PDF
        const doc = new PDFDocument({
            size: 'A5',
            margin: 0,
            font: fontRegular
        });
        const buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));

        const pdfPromise = new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });

        // PDF Design System
        const colors = {
            primary: '#2A8778', // Teal
            secondary: '#134E48', // Dark Teal
            slate: '#0F172A',
            muted: '#4B5563',
            lightMuted: '#9CA3AF',
            border: '#E5E7EB',
            bg: '#FFFFFF',
            cardBg: '#F0FDFA'
        };

        const pageWidth = 420;
        const pageHeight = 595;
        const centerX = pageWidth / 2;

        doc.rect(0, 0, pageWidth, pageHeight).fill(colors.bg);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40).strokeColor(colors.border).lineWidth(0.5).stroke();

        doc.fillColor(colors.slate);
        doc.fontSize(16).font(fontBold);
        doc.text('Cohort', 40, 45, { continued: true });
        doc.fillColor(colors.muted).font(fontRegular).text('Ecosystem');

        doc.fillColor(colors.lightMuted)
            .fontSize(8)
            .font(fontBold)
            .text('OFFICIAL GUEST ACCESS', 0, 50, { align: 'right', width: pageWidth - 60, characterSpacing: 1 });

        doc.moveTo(40, 80).lineTo(pageWidth - 40, 80).strokeColor(colors.border).lineWidth(0.5).stroke();

        const cardX = 40;
        const cardY = 100;
        const cardW = pageWidth - 80;
        const cardH = 120;

        const grad = doc.linearGradient(cardX, cardY, cardX + cardW, cardY);
        grad.stop(0, '#134E48').stop(1, '#10B981');
        doc.roundedRect(cardX, cardY, cardW, cardH, 8).fill(grad);

        doc.fillColor('#FFFFFF').fontSize(12).font(fontBold);
        const dayPassText = "DAY PASS";
        const textWidth = doc.widthOfString(dayPassText);
        const lineLen = 80;

        doc.moveTo(centerX - (textWidth / 2) - lineLen - 10, cardY + 25)
            .lineTo(centerX - (textWidth / 2) - 10, cardY + 25)
            .strokeOpacity(0.3).strokeColor('#FFFFFF').lineWidth(1).stroke();

        doc.moveTo(centerX + (textWidth / 2) + 10, cardY + 25)
            .lineTo(centerX + (textWidth / 2) + lineLen + 10, cardY + 25)
            .strokeOpacity(0.3).strokeColor('#FFFFFF').lineWidth(1).stroke();

        doc.fillOpacity(1).text(dayPassText, 0, cardY + 20, { align: 'center' });
        doc.fillOpacity(0.7).fillColor('#FFFFFF').fontSize(7).font(fontBold).text('PASS ID', 0, cardY + 45, { align: 'center' });
        doc.fillOpacity(1).fillColor('#FFFFFF').fontSize(28).font(fontBold).text(passCode, 0, cardY + 65, { align: 'center' });

        const infoY = cardY + cardH + 15;
        const colW = (pageWidth - 80) / 2;

        doc.fillColor(colors.muted).fontSize(7).font(fontBold).text('VISITOR NAME', 40, infoY);
        doc.fillColor(colors.slate).fontSize(10).font(fontBold).text(name, 40, infoY + 12, { width: colW - 10 });

        doc.fillColor(colors.muted).fontSize(7).font(fontBold).text('VISIT DATE', 40 + colW + 10, infoY);
        doc.fillColor(colors.slate).fontSize(10).font(fontBold).text(new Date(visitDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), 40 + colW + 10, infoY + 12, { width: colW - 10 });

        const purposeY = infoY + 38;
        doc.fillColor(colors.muted).fontSize(7).font(fontBold).text('PURPOSE OF VISIT', 40, purposeY);
        doc.fillColor(colors.slate).fontSize(10).font(fontBold).text(`"${purpose}"`, 40, purposeY + 12, { width: pageWidth - 80 });

        const dividerY = purposeY + 42;
        doc.moveTo(40, dividerY).lineTo(pageWidth - 40, dividerY).strokeColor(colors.border).lineWidth(0.5).stroke();

        const scanText = "SCAN AT RECEPTION";
        doc.fontSize(7).font(fontBold);
        const scanTextW = doc.widthOfString(scanText);
        doc.fillColor(colors.muted).text(scanText, 0, dividerY + 15, { align: 'center' });

        doc.moveTo(40, dividerY + 20).lineTo(centerX - (scanTextW / 2) - 10, dividerY + 20).strokeColor(colors.border).lineWidth(0.5).stroke();
        doc.moveTo(centerX + (scanTextW / 2) + 10, dividerY + 20).lineTo(pageWidth - 40, dividerY + 20).strokeColor(colors.border).lineWidth(0.5).stroke();

        const qrSize = 130;
        const qrBoxY = dividerY + 45;

        doc.roundedRect(centerX - (qrSize / 2) - 15, qrBoxY - 15, qrSize + 30, qrSize + 30, 8).fill(colors.cardBg);
        doc.image(qrCodeData, centerX - (qrSize / 2), qrBoxY, { fit: [qrSize, qrSize] });

        const footerY = pageHeight - 75;
        doc.fillColor(colors.muted).fontSize(7).font(fontRegular).text('This pass is non-transferable and valid only for the date specified above.', 40, footerY, { align: 'center', width: pageWidth - 80 }).text('Access is subject to Cohort terms of service and security policies.', { align: 'center', width: pageWidth - 80 });

        const webLink = "www.cohortwork.com";
        doc.fontSize(9).font(fontBold);
        const webW = doc.widthOfString(webLink);
        doc.fillColor(colors.secondary).text(webLink, 0, pageHeight - 40, { align: 'center' });

        doc.moveTo(40, pageHeight - 35).lineTo(centerX - (webW / 2) - 10, pageHeight - 35).strokeColor(colors.border).lineWidth(0.5).stroke();
        doc.moveTo(centerX + (webW / 2) + 10, pageHeight - 35).lineTo(pageWidth - 40, pageHeight - 35).strokeColor(colors.border).lineWidth(0.5).stroke();

        doc.end();

        const pdfBuffer = await pdfPromise;

        await sendEmail({
            email,
            subject: 'Your Cohort Day Pass',
            message: `
        <h1>Hello ${name},</h1>
        <p>Thank you for your interest in visiting Cohort Ecosystem. Attached to this email is your Day Pass for ${new Date(visitDate).toLocaleDateString()}.</p>
        <p><strong>Pass Code:</strong> ${passCode}</p>
        <p>Please present the attached QR code at the reception when you arrive.</p>
        <p>We look forward to seeing you!</p>
        <br/>
        <p>Best regards,<br/>Cohort Team</p>
      `,
            attachments: [
                {
                    filename: `DayPass-${passCode}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        return NextResponse.json({
            success: true,
            message: 'Day Pass generated and sent to email',
            data: dayPass
        }, { status: 201 });

    } catch (error: any) {
        console.error('Day Pass Error:', error);
        return NextResponse.json({ message: error.message || 'Error generating day pass' }, { status: 500 });
    }
}
