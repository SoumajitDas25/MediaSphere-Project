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

const changePassword = async(oldPassword,newPassword)=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/change-password`,
            {oldPassword,newPassword},
            'PATCH'
        );
        return reponse;
    }
    catch(error)
    {
        throw error;
    }
}

const updateAccountDetails = async(updatedData)=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/update-account`,
            updatedData,
            'PATCH'
        );
        return reponse;
    }
    catch(error)
    {
        throw error;
    }
}

const updateAvatar = async({newAvatar})=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/update-avatar`,
            {avatar:newAvatar},
            'PATCH',
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

const updateCoverImage = async({newCoverImage})=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/update-cover-image`,
            {coverImage:newCoverImage},
            'PATCH',
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

const getWatchHistory = async()=>{
    try
    {
        const reponse = await api(
            `/${routePrefix}/get-watch-history`,
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
    getUserChannelProfile,
    changePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getWatchHistory
}