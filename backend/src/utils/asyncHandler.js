const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next); //forwards the error(if any) to the error-handler middleware
    };
};

export default asyncHandler;