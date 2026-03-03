import nodemailer from 'nodemailer';

const sendEmail = async (options: {
    email: string;
    subject: string;
    message: string;
    attachments?: any[]
}) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `Cohort Ecosystem <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
        attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
