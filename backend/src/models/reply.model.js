import { Schema,model } from "mongoose";
 
const replySchema = new Schema({
    video:{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    repliedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User' 
    },
    likesCount: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        required: true
    }
},{timestamps:true});

export const Reply = model('Reply',replySchema);