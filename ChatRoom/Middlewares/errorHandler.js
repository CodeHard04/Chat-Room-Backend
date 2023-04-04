const globalErrorHandler = (err,req,res,next)=>{
    const errorRes = res.status(err.status || 500);
    switch(true){
        case err.name === "CustomError":
            errorRes.json({
                success: false,
                error: err
            })
            break;
        case err.message === "Validation error":
            res.status(400).json({
                success: false,
                message: "Validation error occurred",
                errors: Object.values(err.errors).map((errObj) => errObj.message),
            });
            break;
        default:
            errorRes.json({
                status: err.status || 500,
                message: err.message || "something went wrong",
                stack: err.stack
            });
            break;
    }
};

module.exports = globalErrorHandler;