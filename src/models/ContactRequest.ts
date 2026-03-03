import mongoose, { Document, Schema } from 'mongoose';

export interface IContactRequest extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone: string;
    status: 'Pending' | 'Reviewed' | 'Completed';
}

const contactRequestSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false, // Making it optional for now to avoid breaking existing data if any, but user asked for it.
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Completed'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

const ContactRequest = mongoose.models.ContactRequest || mongoose.model<IContactRequest>('ContactRequest', contactRequestSchema);

export default ContactRequest;

