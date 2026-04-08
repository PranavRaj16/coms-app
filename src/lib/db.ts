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

// --- Background Task Scheduler (for local environments without external crons) ---
if (typeof window === 'undefined' && !(global as any)._cron_initialized) {
    (global as any)._cron_initialized = true;
    
    // We use dynamic import to avoid circular dependency and only load when needed
    setTimeout(() => {
        import('./services/invoiceService').then(({ processMonthlyInvoices }) => {
            console.log("[BACKGROUND_CRON] Invoice scheduler initialized. Monitoring time...");
            
            setInterval(() => {
                const now = new Date();
                const istTime = new Intl.DateTimeFormat('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).format(now);
                
                // Keep the scheduler active with a log periodically
                if (now.getMinutes() === 0) {
                    console.log(`[BACKGROUND_CRON] Heartbeat... IST: ${istTime}`);
                }
 
                // Check for target times (10:00 AM IST on the 1st of every month)
                const isTargetTime = (istTime === '10:00');
                const isFirstDay = (now.getDate() === 1);
                
                if (isTargetTime && isFirstDay) {
                     console.log(`[BACKGROUND_CRON] 1ST OF MONTH DETECTED! Triggering official invoice generation at ${istTime} IST...`);
                     
                     // Generate for the PREVIOUS month (e.g. if it's June 1, generate for May)
                     const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                     
                     processMonthlyInvoices(previousMonthDate)
                        .then(res => {
                            console.log(`[BACKGROUND_CRON] SUCCESS: Invoices generated for ${res.billingMonthLabel}`);
                            console.log(` - Total Generated: ${res.generated}`);
                            console.log(` - Already Processed: ${res.alreadyInvoiced}`);
                        })
                        .catch(err => console.error(`[BACKGROUND_CRON] FAILED:`, err.message));
                }
            }, 60000); // Check every minute
        }).catch(err => console.error("[BACKGROUND_CRON] Initialization failed:", err.message));
    }, 5000); // Delay start slightly to let DB stabilize
}

