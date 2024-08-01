import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB= async ()=>{
    try
    {
        const conntectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
        console.log(`\nDATABASE succecssfully connected ! DB Host: ${conntectionInstance.connection.host}`);
    }
    catch(error)
    {
        console.error("DATABASE connection FAILED: ",error);
        process.exit(1);
    }
}

export default connectDB;