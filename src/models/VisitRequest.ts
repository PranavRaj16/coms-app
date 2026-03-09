import mongoose, { Schema, Document } from 'mongoose';
import './Workspace'; // Ensure Workspace model is registered for refs

export interface IVisitRequest extends Document {
    workspaceId: mongoose.Types.ObjectId;
    workspaceName: string;
    fullName: string;
    email: string;
    contactNumber: string;
    visitDate: Date;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const VisitRequestSchema: Schema = new Schema({
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    workspaceName: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    visitDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

const VisitRequest = mongoose.models.VisitRequest || mongoose.model<IVisitRequest>('VisitRequest', VisitRequestSchema);

export default VisitRequest;
