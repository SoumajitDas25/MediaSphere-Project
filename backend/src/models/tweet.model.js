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
    }
},{timestamps: true});

export const Tweet = model("Tweet",tweetSchema);