import mongoose, { Document, Schema } from 'mongoose';

export interface IAgreement extends Document {
    userId: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    workspaceName: string;
    userName: string;
    userEmail: string;
    fileUrl: string;       // Cloudinary URL
    fileName: string;      // Original filename
    publicId: string;      // Cloudinary public_id for deletion
    startDate?: Date;
    endDate?: Date;
    uploadedBy: mongoose.Types.ObjectId;
    notes?: string;
}

const agreementSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        default: null
    },
    workspaceName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Agreement = mongoose.models.Agreement || mongoose.model<IAgreement>('Agreement', agreementSchema);
export default Agreement;
