import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    bookingId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    workspaceName: string;
    amount: number;
    paymentMethod: 'Pay Now' | 'Pay Later' | 'Invoice';
    status: 'Pending' | 'Paid' | 'Cancelled';
    dueDate: Date;
    paidDate?: Date;
}

const invoiceSchema: Schema = new Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingRequest',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    workspaceName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Pay Now', 'Pay Later', 'Invoice'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date
    }
}, {
    timestamps: true
});

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;

