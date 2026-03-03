const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://cohortlaunchpad_db:Cohortlaunchpad2@ac-srvr4g9-shard-00-00.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-01.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-02.exwa81x.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const wss = await mongoose.connection.collection('workspaces').find({}).toArray();
        for (const ws of wss) {
            if (ws.allottedTo) {
                console.log('FOUND WS with allottedTo:', ws.name, 'AllottedTo:', ws.allottedTo);
                return;
            }
        }
        console.log('No workspace with allottedTo found in raw collection check.');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

check();
