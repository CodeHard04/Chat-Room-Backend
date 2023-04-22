const jwt=require('jsonwebtoken');
const catchAsyncError = require("../Utilities/catchAsyncError");
const CustomError = require('../Utilities/customError');
const redis = require('redis');
const client = redis.createClient();
class authentication{
// constructor(){
//     client.on("connect", (err) => {
//         console.log("Client connected to Redis...");
//     });
//     client.on("ready", (err) => {
//         console.log("Redis ready to use");
//     });
//     client.on("error", (err) => {
//         console.error("Redis Client", err);
//     });
//     client.on("end", () => {
//         console.log("Redis disconnected successfully");
//     });
// }
authenticate=catchAsyncError(async(req,res,next)=>{
    client.on("connect", (err) => {
        console.log("Client connected to Redis...");
    });
    client.on("ready", (err) => {
        console.log("Redis ready to use");
    });
    client.on("error", (err) => {
        console.error("Redis Client", err);
    });
    client.on("end", () => {
        console.log("Redis disconnected successfully");
    });
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader)
        throw new CustomError("authToken isn't provided", 400);
    const authToken = authorizationHeader.split(" ")[1];
    if(!client.isReady)
    {await client.connect();}
    const black=await client.get(authToken);
    console.log("black",black);
    if(!await client.EXISTS(authToken)){
        await client.quit();
        return res.status(400).json({
            success:false,
            message:"Please login Again token Expires"
        })
    }
    // await client.disconnect();
    // await client.quit();
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