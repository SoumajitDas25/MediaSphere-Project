import Api from "./config/API";

const routePrefix = 'likes';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const toggleVideoLike = async (videoId) =>{
    try
    {
        const response =  await api(
            `/toggle/video/${videoId}`,
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

const toggleTweetLike = async (tweetId) =>{
    try
    {
        const response =  await api(
            `/toggle/tweet/${tweetId}`,
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

const toggleCommentLike = async (commentId) =>{
    try
    {
        const response =  await api(
            `/toggle/comment/${commentId}`,
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

const toggleReplyLike = async (replyId) =>{
    try
    {
        const response =  await api(
            `/toggle/reply/${replyId}`,
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
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    toggleReplyLike
}