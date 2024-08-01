import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileUpload = async (localFilePath,asset_folder)=>{
    try
    {
        if(localFilePath)
        {
            //upload the file on cloudinary
            const response= await cloudinary.uploader.upload(localFilePath,{
                asset_folder: `${process.env.CLOUDINARY_PROJECT_FOLDER}/${asset_folder}`,
                resource_type: 'auto'
            });
            //remove the locally saved temporary file after successful upload
            fs.unlinkSync(localFilePath);
            return response;
        }
        else
        return null;
    }
    catch(error)
    {
        //remove the locally saved temporary file as upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {fileUpload};