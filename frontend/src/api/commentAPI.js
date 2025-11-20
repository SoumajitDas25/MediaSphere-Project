import Api from "./config/API";

const routePrefix = 'comments';
const ApiInstance = new Api(routePrefix,true);
const {api} = ApiInstance;

const getVideoComments = async (videoId,page,limit) =>{
    try
    {
        const response =  await api(
            `/video/${videoId}`,
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

const getTweetComments = async (tweetId,page,limit) =>{
    try
    {
        const response =  await api(
            `/tweet/${tweetId}`,
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

const addVideoComment = async (videoId,content) =>{
    try
    {
        const response =  await api(
            `/video/${videoId}`,
            { 
                content:content             
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

const addTweetComment = async (tweetId,content) =>{
    try
    {
        const response =  await api(
            `/tweet/${tweetId}`,
            { 
                content:content             
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

const updateComment = async (commentId,content) =>{
    try
    {
        const response =  await api(
            `/${commentId}`,
            { 
                content:content             
            },
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const deleteComment = async (commentId) =>{
    try
    {
        const response =  await api(
            `/${commentId}`,
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

export default {
    getVideoComments,
    getTweetComments,
    addVideoComment,
    addTweetComment,
    updateComment,
    deleteComment
}