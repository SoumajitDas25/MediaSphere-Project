import axios from "axios";

axios.defaults.baseURL = 'http://localhost:3000/api/v1';
axios.defaults.withCredentials = true; //allow all credentials
axios.defaults.validateStatus = ()=>true; //allow all statusCode

const api = async (
    relativePath, 
    data = {},
    method = 'POST',
    headers = {}
    ) => {    
    try 
    {
        const response = await axios({
            url: relativePath,
            method: method,
            data: (method === 'POST' || method === 'PUT' || method === 'PATCH') ? data : null,
            params: method === 'GET' ? data : null,  //params for GET requests
            headers: headers,
        });
        return response;
    } 
    catch (error) 
    {
        throw error;
    }
};
  
export default api;