import Api from "./config/API";

const routePrefix = 'tweets';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const getUserTweets = async (userId,page,limit)=>{
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

const createTweet = async (content)=>{
    try
    {
        const response =  await api(
            `/`,
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

const getTweetById = async (tweetId)=>{
    try
    {
        const response =  await api(
            `/${tweetId}`,
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
const updateTweet = async (tweetId,content)=>{
    try
    {
        const response =  await api(
            `/${tweetId}`,
            {
                content
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
const deleteTweet = async (tweetId)=>{
    try
    {
        const response =  await api(
            `/${tweetId}`,
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
    getUserTweets,
    createTweet,
    getTweetById,
    updateTweet,
    deleteTweet
}