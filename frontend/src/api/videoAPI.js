import Api from "./config/API";

const routePrefix = 'videos';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const getUserVideos = async (userId,page,limit)=>{
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

const publishVideo = async(uploadData,setProgress)=>{
    try
    {
        const {video,thumbnail,title,description}=uploadData;
        const formData= new FormData();
        formData.append('videoFile',video);
        formData.append('thumbnailFile',thumbnail);
        formData.append('title',title);
        formData.append('description',description);

        const response =  await api(
            `/`,
            formData,
            'POST',
            {
                'Content-Type': 'multipart/form-data'
            },
            { //uploadProgress
                setProgress,
                limit: 100
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

export default {
    getUserVideos,
    publishVideo,
    getVideoById
}