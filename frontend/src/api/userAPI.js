import api from "./apiConfig";

const routePrefix = 'users';

const getUser = async ()=>{
    try
    {
        const response =  await api(
            `/${routePrefix}/current-user`,
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

const signup = async (data)=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/signup`,
            data,
            'POST',
            {
            'Content-Type': 'multipart/form-data'
            }
        );
        return reponse;
    }
    catch(error)
    {
        throw error;
    }
}

const getUserChannelProfile = async (username)=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/channel/${username}`,
            {},
            'GET'
        );
        return reponse;
    }
    catch(error)
    {
        throw error;
    }
}

export default {
    getUser,
    signup,
    getUserChannelProfile
}