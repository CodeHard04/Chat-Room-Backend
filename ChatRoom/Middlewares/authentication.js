const jwt=require('jsonwebtoken');
const catchAsyncError = require("../Utilities/catchAsyncError");
const CustomError = require('../Utilities/customError');

class authentication{

authenticate=catchAsyncError(async(req,res,next)=>{
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader)
        throw new CustomError("authToken isn't provided", 400);
    const authToken = authorizationHeader.split(" ")[1];
    const jwtSecretKey=process.env.JWT_SECRET_KEY;
    console.log("authToken",authToken);
    jwt.verify(authToken,jwtSecretKey,function(err,decoded){
        if(err){
            throw new CustomError(err.message,400);
        }
        console.log(decoded);
        if(decoded){
            req.userData = decoded;
            next();
        }
        else{
            throw new CustomError("Invalid Authorization Token",400);
        }
    });
})
}

module.exports = new authentication;