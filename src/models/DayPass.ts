import mongoose from 'mongoose';

const dayPassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
    },
    contact: {
        type: String,
        required: [true, 'Please provide your contact number'],
    },
    purpose: {
        type: String,
        required: [true, 'Please provide the purpose of your visit'],
    },
    visitDate: {
        type: Date,
        required: [true, 'Please provide the date of your visit'],
    },
    passCode: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Used', 'Expired'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

const DayPass = mongoose.models.DayPass || mongoose.model('DayPass', dayPassSchema);

export default DayPass;

