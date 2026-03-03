const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://cohortlaunchpad_db:Cohortlaunchpad2@ac-srvr4g9-shard-00-00.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-01.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-02.exwa81x.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const ws = await mongoose.connection.collection('workspaces').findOne({ allottedTo: { $ne: null } });
        console.log('Workspace with allotted user:', JSON.stringify(ws, null, 2));

        const allUsers = await mongoose.connection.collection('users').find({}).toArray();
        console.log('Total users in DB:', allUsers.length);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

check();
