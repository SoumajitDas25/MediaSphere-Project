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

const deleteFile = async (fileUrl)=>
{
    try
    { 
        if(fileUrl)
        {
            //extract the file public id from the url
            const publicId = fileUrl.substring(fileUrl.lastIndexOf('/')+1,fileUrl.lastIndexOf('.'));
            
            //delete the file from cloudinary
            const response = await cloudinary.api.delete_resources(
                [publicId], 
                { type: 'upload', resource_type: 'image' }
            )
            return response;
        }
        return null;
    }
    catch(error)
    {
        return null;
    }
}

const deleteVideoFile = async (fileUrl)=>
{
    try
    { 
        if(fileUrl)
        {
            //extract the file public id from the url
            const publicId = fileUrl.substring(fileUrl.lastIndexOf('/')+1,fileUrl.lastIndexOf('.'));
            
            //delete the file from cloudinary
            const response = await cloudinary.api.delete_resources(
                [publicId], 
                { type: 'upload', resource_type: 'video' }
            )
            return response;
        }
        return null;
    }
    catch(error)
    {
        return null;
    }
}

export {fileUpload,deleteFile,deleteVideoFile};