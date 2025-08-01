import axios from "./apiConfig";

class Api 
{

    //property
    routePrefix; 
    validateStatus;

    //constructor
    constructor(routePrefix,allowAllStatusCode){
        this.routePrefix = routePrefix;
        if(allowAllStatusCode)
        this.validateStatus=true;
    }

    //method
    api = async (
        relativePath, 
        data = {},
        method = 'POST',
        headers = {},
        uploadProgress=null
        ) => {    
        try 
        {
            const response = await axios({
                url: `${this.routePrefix}/${relativePath}`,
                method: method,
                data: (method === 'POST' || method === 'PUT' || method === 'PATCH') ? data : null,
                params: method === 'GET' ? data : null,  //params for GET requests
                headers: headers,
                onUploadProgress: uploadProgress && uploadProgress.setProgress?
                (event)=>{
                    const percent = Math.round((event.loaded*(uploadProgress.limit?uploadProgress.limit:100))/event.total);
                    uploadProgress.setProgress(percent,1);
                }:null,
                validateStatus: (status) => this.validateStatus?true:status >= 200 && status < 300
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