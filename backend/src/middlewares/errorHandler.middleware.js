import { SERVER_ERROR_MESSAGE } from "../constants.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    let message;
    if (statusCode < 500) {
        //client error
        message = err.message || "Client Error";
    } else {
        //server error
        message = SERVER_ERROR_MESSAGE;
        //log the actual server error
        console.error(err);
    }

    res.status(statusCode).json({
        statusCode,
        success: false,
        message,
    });
};

export default errorHandler;
