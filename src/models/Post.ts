import mongoose, { Document, Schema } from 'mongoose';

export interface IReply {
    _id?: mongoose.Types.ObjectId | string;
    user: mongoose.Types.ObjectId | string;
    userName: string;
    text: string;
    replies?: IReply[];
    createdAt: Date;
}

export interface IComment {
    _id?: mongoose.Types.ObjectId | string;
    user: mongoose.Types.ObjectId | string;
    userName: string;
    text: string;
    upvotes: string[];
    replies: IReply[];
    createdAt: Date;
}

export interface IPost extends Document {
    author: mongoose.Types.ObjectId | string;
    authorName: string;
    content: string;
    upvotes: string[];
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema: Schema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    upvotes: {
        type: [String],
        default: [],
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            userName: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            upvotes: {
                type: [String],
                default: [],
            },
            replies: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                        required: true,
                    },
                    userName: {
                        type: String,
                        required: true,
                    },
                    text: {
                        type: String,
                        required: true,
                    },
                    replies: [
                        {
                            user: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'User',
                                required: true,
                            },
                            userName: {
                                type: String,
                                required: true,
                            },
                            text: {
                                type: String,
                                required: true,
                            },
                            createdAt: {
                                type: Date,
                                default: Date.now,
                            },
                        }
                    ],
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;

