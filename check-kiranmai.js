const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://cohortlaunchpad_db:Cohortlaunchpad2@ac-srvr4g9-shard-00-00.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-01.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-02.exwa81x.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority";

// Define Minimal Schemas for checking
const UserSchema = new mongoose.Schema({
    name: String,
    role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const WorkspaceSchema = new mongoose.Schema({
    name: String,
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String
    }]
});
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const user = await User.findOne({ name: /Kiran Mai/i });
        if (!user) {
            console.log('User Kiran Mai not found');
            const allUsers = await User.find({}).limit(10);
            console.log('Sample users in DB:', allUsers.map(u => u.name));
            process.exit(0);
        }

        console.log('User found:', user.name, 'ID:', user._id);

        const ws = await Workspace.findOne({ 'members.user': user._id });
        if (ws) {
            console.log('Workspace found for user via members.user:', ws.name);
            console.log('Full WS details:', JSON.stringify(ws, null, 2));
        } else {
            console.log('No workspace found for user in members.user');

            // Try searching by name if ID mismatch
            const allWs = await Workspace.find({});
            console.log('Total workspaces:', allWs.length);
            for (const workspace of allWs) {
                if (workspace.members && workspace.members.length > 0) {
                    const found = workspace.members.find(m => m.user && m.user.toString() === user._id.toString());
                    if (found) {
                        console.log('MATCH FOUND in loop for WS:', workspace.name);
                    }
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

check();
