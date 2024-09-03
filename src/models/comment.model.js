import { Schema,model } from "mongoose";

const commentSchema = new Schema({
    content:{
        type: String,
        requied: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likesCount: {
        type: Number,
        default: 0
    },
    replies:[
        {
            type: Schema.Types.ObjectId,
            ref: "Reply"
        }
    ]
},{timestamps: true});

export const Comment = model("Comment",commentSchema);


//A- Comment 1
//B- @A: Reply 1 {id:reply1Id, comment:comment1Id, repliedTo:comment1Id, owner:B, content:Reply1}
//C- @B: Reply 2 {id:reply2Id, comment:comment1Id, repliedTo:reply1Id, owner:C, content:Reply2}
//A- @B: Reply 3 {id:reply3Id, comment:comment1Id, repliedTo:reply1Id, owner:A, content:Reply3}