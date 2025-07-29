import { Schema,model } from "mongoose";

const tweetSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    likesCount:{
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
},{timestamps: true});

export const Tweet = model("Tweet",tweetSchema);