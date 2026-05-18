import { Schema,model } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // visibility: {
    //     type: String,
    //     enum: ['public','private'],
    //     default: 'public'
    // },
    isPrivate:{
        type: Boolean,
        default:false
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});

export const Playlist = model("Playlist",playlistSchema);