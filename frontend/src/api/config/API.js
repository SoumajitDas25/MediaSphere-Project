import axios from "./apiConfig";

class Api 
{

    //property
    routePrefix; 

    //constructor
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    //method
    api = async (
        relativePath, 
        data = {},
        method = 'POST',
        headers = {}
        ) => {    
        try 
        {
            const response = await axios({
                url: `${this.routePrefix}/${relativePath}`,
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

}
  
export default Api;