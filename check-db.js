const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://cohortlaunchpad_db:Cohortlaunchpad2@ac-srvr4g9-shard-00-00.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-01.exwa81x.mongodb.net:27017,ac-srvr4g9-shard-00-02.exwa81x.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority";

const PostSchema = new mongoose.Schema({
    author: mongoose.Schema.Types.ObjectId,
    authorName: String,
    content: String
}, { timestamps: true });
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

const WorkspaceSchema = new mongoose.Schema({
    name: String,
    allottedTo: mongoose.Schema.Types.ObjectId
});
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);

        const postsCount = await Post.countDocuments({});
        console.log('Total posts in DB:', postsCount);

        const posts = await Post.find({}).limit(5);
        console.log('Sample posts:', JSON.stringify(posts, null, 2));

        const allottedWs = await Workspace.find({ allottedTo: { $ne: null } });
        console.log('Workspaces with allotted users:', allottedWs.length);
        for (const ws of allottedWs) {
            console.log(`- ${ws.name} allotted to ${ws.allottedTo}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

check();
