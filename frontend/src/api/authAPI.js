import Api from "./config/API";

const routePrefix = 'users';
const ApiInstance = new Api(routePrefix,true);
const {api} = ApiInstance;

const login = async (data)=>{
    try
    {
        const response =  await api(
            `/login`,
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
            `/logout`,
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
            `/refresh-token`,
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