import Api from "./config/API";

const routePrefix = 'playlists';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const createPlaylist = async ({name,description,isPrivate=true,videoId}) => {
    try
    {
        const response =  await api(
            `/`,
            {
                name,
                description,
                isPrivate,
                videoId
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

const getAllUserPlaylists = async (userId,page,limit,videoId=null)=>{
    try
    {
        const response =  await api(
            `/user/${userId}`,
            { //will be converted to query params
                page:page, 
                limit:limit,
                videoId:videoId
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

const getPublicUserPlaylists = async (userId,page,limit,videoId=null)=>{
    try
    {
        const response =  await api(
            `/public/user/${userId}`,
            { //will be converted to query params
                page:page, 
                limit:limit,
                videoId:videoId
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

const addVideoToPlaylist = async (videoId,playlistId)=>{
    try
    {
        const response =  await api(
            `/add/${videoId}/${playlistId}`,
            {},
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const removeVideoFromPlaylist = async (videoId,playlistId)=>{
    try
    {
        const response =  await api(
            `/remove/${videoId}/${playlistId}`,
            {},
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const updatePlaylist = async (playlistId,updatePlaylistData)=>{
    try
    {
        const {name=null,description=null}=updatePlaylistData;

        const data = {};
        if(name)
            data.name=name;
        if(description)
            data.description=description;

        const response =  await api(
            `/${playlistId}`,
            data,
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const deletePlaylist = async (playlistId) =>{
    try
    {
        const response =  await api(
            `/${playlistId}`,
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

const togglePlaylistVisibilityStatus = async (playlistId)=>{
    try
    {
        const response =  await api(
            `/toggle/visibility/${playlistId}`,
            {},
            'PATCH'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

export default {
    createPlaylist,
    getAllUserPlaylists,
    getPublicUserPlaylists,
    getPlaylistVideosById,
    getPlaylistInfoById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    togglePlaylistVisibilityStatus
}