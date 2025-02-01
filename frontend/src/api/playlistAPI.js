import Api from "./config/API";

const routePrefix = 'playlists';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const getUserPlaylists = async (userId,page,limit)=>{
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

const getPlaylistVideosById = async (playlistId,page,limit)=>{
    try
    {
        const response =  await api(
            `/${playlistId}/videos`,
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

const getPlaylistInfoById = async (playlistId)=>{
    try
    {
        const response =  await api(
            `/${playlistId}`,
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
    getUserPlaylists,
    getPlaylistVideosById,
    getPlaylistInfoById
}