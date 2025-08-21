import {v2 as cloudinary} from "cloudinary";
import { deleteTempFileByPath } from "./FileHandler.js";

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
            deleteTempFileByPath(localFilePath);
            return response;
        }
        else
        return null;
    }
    catch(error)
    {
        //remove the locally saved temporary file as upload operation got failed
        deleteTempFileByPath(localFilePath);
        return null;
    }
}

// const fileUploadWithProgressTracking = async (localFilePath,fileSize,fileIndex,asset_folder,socketId)=>{
//     try
//     {
//         // const {emitUploadProgress,emitUploadError} = uploadEmitters;
//         if(localFilePath)
//         {
//             //Read file as stream and report progress
//             const absoluteFilePath=getAbsoluteFilePath(localFilePath);
//             let uploadedBytes = 0;
//             const readStream = fs.createReadStream(absoluteFilePath);

//             readStream
//             .on("data", (chunk) => {
//                 //calculate progress percentage
//                 uploadedBytes += chunk.length;
//                 const progress = fileSize>0? Math.floor((uploadedBytes / fileSize) * 100):100;
//                 //emit to that specific socket
//                 emitUploadProgress(socketId,progress,fileIndex);
//             });  

//             const response = await new Promise((resolve, reject) => {

//                 readStream.on("error",(error)=>{
//                     reject(error);
//                 });

//                 const uploadStream=cloudinary.uploader.upload_stream({
//                     asset_folder: `${process.env.CLOUDINARY_PROJECT_FOLDER}/${asset_folder}`,
//                     resource_type: 'auto'
//                 },
//                 (error, result) => {
//                     if(error) 
//                     reject(error);
//                     else
//                     resolve(result);
//                   }
//                 );

//                 //start the upload
//                 readStream.pipe(uploadStream);
//             });

//             //remove the locally saved temporary file after successful upload
//             deleteTempFileByPath(localFilePath);
//             return response;
//         }
//         else
//         return null;
//     }
//     catch(error)
//     {
//         // console.log('error');
//         //remove the locally saved temporary file as upload operation got failed
//         emitUploadError(socketId);
//         deleteTempFileByPath(localFilePath);
//         return null;
//     }
// }

const generateFileUploadCredentials = (mediaType='any',moduleName='') => {

    const timestamp = Math.floor(Date.now() / 1000);
    // const publicId = `video_${timestamp}`;

    const paramsToSign = {
        timestamp,
        folder: 'MediaSphere-Project/videos'
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    return {
        signature,
        timestamp,
        // publicId,
        // cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        // uploadPreset: 'mediasphere_video_preset',
        folder: `${process.env.CLOUDINARY_PROJECT_FOLDER}/${moduleName}`,
        upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${(mediaType==='video'||mediaType==='image')?mediaType:'any'}/upload`
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

export {fileUpload,generateFileUploadCredentials,deleteFile,deleteVideoFile};