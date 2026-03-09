import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (cached.promise) {
        try {
            await cached.promise;
        } catch (error) {
            console.log('Detected failed DB promise, clearing cache for retry...');
            cached.promise = null;
        }
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log(`[DB] Attempting connection. URI length: ${MONGODB_URI.length}`);

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log(`[DB] Successfully connected to host: ${mongoose.connection.host}`);
            return mongoose;
        }).catch(err => {
            console.error('[DB] Connection Error:', err.message);
            cached.promise = null; // Clear so next call can retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
