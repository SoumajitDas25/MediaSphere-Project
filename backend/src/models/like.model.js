import { Schema,model } from "mongoose";

const likeSchema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: "Reply"
    },
    targetType: { // Actual target type to disambiguate
        type: String,
        required: true,
        enum: ["video", "tweet", "comment", "reply"]
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    }
},{timestamps: true});

//create a compound index with video/tweet/comment/reply and likedBy field to ensure that each user can like each of them only once
likeSchema.index(
    { video: 1, likedBy: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { targetType: "video" }
    }
);
likeSchema.index(
    { tweet: 1, likedBy: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { targetType: "tweet" }
    }
);
likeSchema.index(
    { comment: 1, likedBy: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { targetType: "comment" } 
    }
);
likeSchema.index(
    { reply: 1, likedBy: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { targetType: "reply" }
    }
);

export const Like = model("Like",likeSchema);