import mongoose, { Document, Schema } from 'mongoose';

export interface IBookingRequest extends Document {
    workspaceId: string;
    workspaceName: string;
    fullName: string;
    email: string;
    contactNumber: string;
    firmName: string;
    duration: string;
    startDate: Date;
    totalAmount: number;
    paymentMethod: 'Pay Now' | 'Pay Later' | 'Invoice';
    paymentStatus: 'Pending' | 'Paid';
    invoiceId?: string;
    status: 'Pending' | 'Awaiting Payment' | 'Confirmed' | 'Rejected' | 'Completed' | 'Cancelled';
}

const bookingRequestSchema: Schema = new Schema({
    workspaceId: {
        type: String,
        required: true,
    },
    workspaceName: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    firmName: {
        type: String,
    },
    duration: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['Pay Now', 'Pay Later', 'Invoice'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    invoiceId: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Awaiting Payment', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

const BookingRequest = mongoose.models.BookingRequest || mongoose.model<IBookingRequest>('BookingRequest', bookingRequestSchema);

export default BookingRequest;

