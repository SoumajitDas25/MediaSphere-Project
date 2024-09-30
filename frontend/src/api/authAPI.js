import api from "./apiConfig";

const routePrefix = 'users';

const login = async (data)=>{
    try
    {
        const response =  await api(
            `/${routePrefix}/login`,
            data,
            'POST'
        );
        return response;
    }
    catch(error)
    {
        throw error;
    }
}

const logout = async ()=>{
    try
    {
        const response =  await api(
            `/${routePrefix}/logout`,
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

const refreshToken = async ()=>{
    try
    {
        const response =  await api(
            `/${routePrefix}/refresh-token`,
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

export default {
    login,
    logout,
    refreshToken
}