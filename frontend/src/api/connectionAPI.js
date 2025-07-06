import Api from "./config/API";

const routePrefix = 'connections';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const toggleSubscription = async (userId) =>{
    try
    {
        const response =  await api(
            `/c/${userId}`,
            {},
            'POST'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const getSubscribers = async (userId,page,limit) =>{
    try
    {
        const response =  await api(
            `/c/${userId}`,
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

const getSubscriptions = async (userId,page,limit) =>{
    try
    {
        const response =  await api(
            `/u/${userId}`,
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

export default {
    toggleSubscription,
    getSubscribers,
    getSubscriptions
}