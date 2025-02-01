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

export default {
    getUserVideos
}