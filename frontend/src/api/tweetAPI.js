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

export default {
    getUserTweets,
    createTweet
}