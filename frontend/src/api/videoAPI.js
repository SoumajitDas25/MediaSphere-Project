import api from "./apiConfig";

const routePrefix = 'videos';

const getUserVideos = async (userId,page,limit)=>{
    try
    {
        const response =  await api(
            `/${routePrefix}/user/${userId}`,
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