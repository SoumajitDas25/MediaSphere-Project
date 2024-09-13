import { SERVER_ERROR_MESSAGE } from "../constants.js";

const asyncHandler = (requestHandler) => async (req, res, next) => {
    try 
    {
        await requestHandler(req, res, next)
    } 
    catch(error) 
    {
        //some unexpected server error
        if(!error.statusCode)
        { 
            //send a server error response to the client
            res.status(500).json(
                {
                    error: SERVER_ERROR_MESSAGE,
                    success: false
                }
            );
        }

        // next(error)
        //check whether it is client error or server error
        if(error.statusCode < 500)
        {
            //client error

            //send the client error response to the client
            res.status(error.statusCode).json(
                {
                    error: error.message,
                    statusCode: error.statusCode,
                    success: false
                }
            );
        }
        else
        {
            //server error

            console.log("Server Error: ",error.message); //log the server error message

             // Extracting the file path & line no.
            const stackLines = error.stack.split('\n');
            const relevantLine = stackLines[1].trim();
            console.log('Error occurred in: ', relevantLine);

            //send a server error response to the client
            res.status(error.statusCode).json(
                {
                    error: SERVER_ERROR_MESSAGE,
                    success: false
                }
            );
        }
    }
}

export default asyncHandler;