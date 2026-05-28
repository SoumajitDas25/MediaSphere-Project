import axios from "axios";
import Api from "./config/API";

const routePrefix = 'videos';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;
const plainAxios = axios.create(); //for requesting to third-party urls

const getAllVideos = async (page,limit)=>{
    try
    {
        const response =  await api(
            `/`,
            { //will be converted to query params
                page:page,
                limit:limit
            },
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getPublishedVideos = async (page,limit)=>{
    try
    {
        const response =  await api(
            `/published/all`,
            { //will be converted to query params
                page:page,
                limit:limit
            },
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getAllUserVideos = async (userId,page,limit)=>{
    try
    {
        const response =  await api(
            `/user/${userId}`,
            { //will be converted to query params
                page:page,
                limit:limit
            },
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getPublishedUserVideos = async (userId,page,limit)=>{
    try
    {
        const response =  await api(
            `/published/user/${userId}`,
            { //will be converted to query params
                page:page,
                limit:limit
            },
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}
const publishVideo = async(publishVideoData)=>{
    try
    {
        const {videoMetadata,thumbnailMetadata,title,description}=publishVideoData;

        const response =  await api(
            `/`,
            {
                videoMetadata,
                thumbnailMetadata,
                title,
                description
            },
            'POST'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getFileUploadCredentials = async (mediaType='image')=>{
    try
    {
        const response =  await api(
            `/upload/generate-credentials/${mediaType.toLowerCase()}`,
            {},
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const uploadFileToCloudinary = async(file,uploadCredentials,setProgress)=>{
    try
    {
        const {signature,timestamp,apiKey,folder,upload_url} = uploadCredentials;
        const formData= new FormData();
        formData.append('file',file);
        formData.append('api_key',apiKey);
        formData.append('timestamp',timestamp);
        formData.append('signature',signature);
        formData.append('folder',folder);

        const response = await plainAxios.post(
            upload_url,
            formData,
            {
                onUploadProgress: (event)=>{
                    setProgress(event.loaded);
                },
                withCredentials:false
            }
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getVideoById = async (videoId)=>{
    try
    {
        const response =  await api(
            `/${videoId}`,
            {},
            'GET'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const updateVideo = async (videoId,updateVideoData)=>{
    try
    {
        const {thumbnail=null,title=null,description=null}=updateVideoData;

        const formData= new FormData();
        if(thumbnail)
        formData.append('thumbnail',thumbnail);
        if(title)
        formData.append('title',title);
        if(description)
        formData.append('description',description);

        const response =  await api(
            `/${videoId}`,
            formData,
            'PATCH',
            {
            'Content-Type': 'multipart/form-data'
            }
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const deleteVideo = async (videoId) =>{
    try
    {
        const response =  await api(
            `/${videoId}`,
            {},
            'DELETE'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const toggleVideoPublishStatus = async (videoId)=>{
    try
    {
        const response =  await api(
            `/toggle/publish/${videoId}`,
            {},
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

export default {
    getAllVideos,
    getPublishedVideos,
    getAllUserVideos,
    getPublishedUserVideos,
    publishVideo,
    getFileUploadCredentials,
    uploadFileToCloudinary,
    getVideoById,
    updateVideo,
    deleteVideo,
    toggleVideoPublishStatus
}