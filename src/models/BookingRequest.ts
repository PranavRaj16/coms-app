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
    paymentMethod: 'Pay Now' | 'Pay Later' | 'Pay Monthly' | 'Pay Montly';
    paymentStatus: 'Pending' | 'Paid';
    endDate?: Date;
    invoiceId?: string;
    seatCount?: number;
    userId?: string;
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
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    endDate: {
        type: Date,
    },
    invoiceId: {
        type: String,
        unique: true,
        sparse: true,
    },
    seatCount: {
        type: Number,
        default: 1
    },
    userId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Awaiting Payment', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

if (mongoose.models.BookingRequest) {
    delete mongoose.models.BookingRequest;
}

const BookingRequest = mongoose.model<IBookingRequest>('BookingRequest', bookingRequestSchema);

export default BookingRequest;

