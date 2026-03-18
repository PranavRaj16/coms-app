import mongoose from 'mongoose';
import User from '../src/models/User';
import connectDB from '../src/lib/db';

async function checkUsers() {
    await connectDB();
    const allUsers = await User.find({});
    console.log('Total Users:', allUsers.length);
    const statuses = allUsers.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
    }, {});
    console.log('Statuses:', statuses);
    process.exit(0);
}

checkUsers();
