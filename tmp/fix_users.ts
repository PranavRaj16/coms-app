import mongoose from 'mongoose';
import User from '../src/models/User';
import fs from 'fs';

async function fix() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const dbUri = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='))?.split('=')[1]?.trim();
    if (!dbUri) throw new Error('No MONGODB_URI found');

    await mongoose.connect(dbUri);
    const res = await User.updateMany(
        { status: { $in: [null, undefined, 'Pending'] } },
        { $set: { status: 'Active' } }
    );
    console.log('Updated users from Pending/null to Active:', res);
    process.exit(0);
}

fix();
