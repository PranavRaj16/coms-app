import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    bookingId?: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    workspaceName: string;
    amount: number;
    paymentMethod: 'Pay Now' | 'Pay Later' | 'Invoice' | 'Monthly';
    status: 'Pending' | 'Paid' | 'Cancelled';
    type: 'booking' | 'recurring';
    billingMonth?: string; // e.g. "2026-03" for March 2026
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
        default: null
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        default: null
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
        enum: ['Pay Now', 'Pay Later', 'Invoice', 'Monthly'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    type: {
        type: String,
        enum: ['booking', 'recurring'],
        default: 'booking'
    },
    billingMonth: {
        type: String,
        default: null
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
