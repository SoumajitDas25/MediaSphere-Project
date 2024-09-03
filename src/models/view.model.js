import {Schema,model} from "mongoose";

const viewSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    viewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},{timestamps:true});

export const View = model('View',viewSchema);