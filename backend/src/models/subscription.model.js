import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {  //the user who is subscribing 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {  //the user to whom 'subscriber' is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true});

export const Subscription = model('Subscription',subscriptionSchema);