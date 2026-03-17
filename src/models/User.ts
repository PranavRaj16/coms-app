import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    mobile?: string;
    organization?: string;
    password?: string;
    role: 'Admin' | 'Member' | 'Manager' | 'Authenticator';
    status: 'Active' | 'Inactive' | 'Pending';
    joinedDate: string;
    lastActive: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    viewedNotifications: string[];
    matchPassword(password: string): Promise<boolean>;
}

const userSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true,
    },
    organization: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Member', 'Manager', 'Authenticator'],
        default: 'Member',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        default: 'Pending',
    },
    joinedDate: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    viewedNotifications: {
        type: [String],
        default: []
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre('save', async function (this: any) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;

