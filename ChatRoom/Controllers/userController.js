const { User } = require('../Models/User');
const catchAsyncError = require('../Utilities/catchAsyncError');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utilities/customError');
const customError = require('../Utilities/customError');

class userController {
    saveUserData = catchAsyncError(async(req,res,next)=>{
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        const newUser = await User.create({...req.body})
        let data={
            time: Date.now(),
            userId: newUser.userId,
            name:newUser.name,
        }
        const token=jwt.sign(data,jwtSecretKey);
        res.status(201).send(token);
    })
    getUserData = catchAsyncError(async(req,res,next)=>{
        const user=User.findByPk(req.query.id);
        // bcrypt
        // .compare(password, hash)
        // .then(res => {
        //     console.log(res);
        // })
        // .catch(err => console.error(err.message));
        if(!user){
            throw new CustomError("User not exist",400);
        }
        if(!bcrypt.compare(req.query.password,user.password)){
            throw new CustomError("Password does not match",400);
        }
        res.status(200).json({
            success:true,
            message: "successfully Login"
        })
    })

    getUserData = catchAsyncError(async(req,res,next)=>{
        const userData = User.findAll().then(res => {
            console.log("Data of user",res)
            return res;
        }).catch((error) => {
            console.error('Failed to retrieve data : ', error);
        });

        res.status(200).json({
            success: true,
            message: userData
        })
    }) 
}

module.exports = new userController;
