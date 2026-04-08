import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
    name: string;
    location: string;
    floor?: string;
    type: string;
    capacity: string;
    amenities: string[];
    image: string;
    images: string[];
    featured: boolean;
    price: number;
    features: {
        hasConferenceHall: boolean;
        hasCabin: boolean;
        workstationSeats?: number;
        conferenceHallSeats?: number;
        cabinSeats?: number;
        numCabins?: number;
        numConferenceHalls?: number;
    };
    allottedTo?: mongoose.Types.ObjectId | string;
    allotmentStart?: Date;
    allotmentEnd?: Date;
    unavailableUntil?: Date;
    totalSeats?: number;
    availableSeats?: number;
    paymentMethod?: string;
}

const workspaceSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    capacity: {
        type: String,
        required: true,
    },
    amenities: {
        type: [String],
        default: ['High-speed WiFi', 'Coffee Bar'],
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format',
    },
    images: {
        type: [String],
        default: [],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        default: 0,
    },
    features: {
        hasConferenceHall: {
            type: Boolean,
            default: false,
        },
        hasCabin: {
            type: Boolean,
            default: false,
        },
        workstationSeats: {
            type: Number,
            default: 0,
        },
        conferenceHallSeats: {
            type: Number,
            default: 0,
        },
        cabinSeats: {
            type: Number,
            default: 0,
        },
        numCabins: {
            type: Number,
            default: 0,
        },
        numConferenceHalls: {
            type: Number,
            default: 0,
        }
    },
    allottedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    allotmentStart: {
        type: Date,
        default: null
    },
    allotmentEnd: {
        type: Date,
        default: null
    },
    unavailableUntil: {
        type: Date,
        default: null
    },
    totalSeats: {
        type: Number,
        default: 0
    },
    availableSeats: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
});

const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', workspaceSchema);

export default Workspace;

