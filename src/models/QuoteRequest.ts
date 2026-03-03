import mongoose, { Document, Schema } from 'mongoose';

export interface IQuoteRequest extends Document {
    fullName: string;
    workEmail: string;
    contactNumber: string;
    firmName: string;
    firmType: string;
    requiredWorkspace: string;
    capacity: number;
    startDate: Date;
    duration: string;
    additionalRequirements?: string;
    status: 'Pending' | 'Reviewed' | 'Completed';
}

const quoteRequestSchema: Schema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    workEmail: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    firmName: {
        type: String,
        required: true,
    },
    firmType: {
        type: String,
        required: true,
    },
    requiredWorkspace: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    additionalRequirements: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Completed'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

const QuoteRequest = mongoose.models.QuoteRequest || mongoose.model<IQuoteRequest>('QuoteRequest', quoteRequestSchema);

export default QuoteRequest;

