import Api from "./config/API";

const routePrefix = 'replies';
const ApiInstance = new Api(routePrefix,true);
const {api} = ApiInstance;

const getCommentReplies = async (commentId,page,limit) =>{
    try
    {
        const response =  await api(
            `/${commentId}`,
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

const addVideoCommentReply = async (commentId,repliedToId,content) =>{
    try
    {
        const response =  await api(
            `/video/${commentId}/${repliedToId}`,
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

const addTweetCommentReply = async (commentId,repliedToId,content) =>{
    try
    {
        const response =  await api(
            `/tweet/${commentId}/${repliedToId}`,
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

const updateReply = async (replyId,content) =>{
    try
    {
        const response =  await api(
            `/${replyId}`,
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

const deleteReply = async (replyId) =>{
    try
    {
        const response =  await api(
            `/${replyId}`,
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
    getCommentReplies,
    addVideoCommentReply,
    addTweetCommentReply,
    updateReply,
    deleteReply
}