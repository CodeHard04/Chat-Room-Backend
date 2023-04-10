const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../Models/User');
const catchAsyncError = require('../Utilities/catchAsyncError');
const CustomError = require('../Utilities/customError');

class userController {

    getUserData = catchAsyncError(async(req,res,next)=>{
        const user=await User.findByPk(req.query.userId,{attributes:{exclude:['loginTime','createdAt','updatedAt','password']}});
        res.status(200).send(user);
    })

    getAllUser = catchAsyncError(async(req,res,next)=>{
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

    getPreferredUsers = catchAsyncError(async (req, res) =>{
        const { QueryTypes } = require('sequelize');
        const {age, gender, country} = req.query;

        const result = await sequelize.query(
          `SELECT name, age, userId, country, email
          FROM Users
          ORDER BY CASE WHEN age = ? AND gender = ? AND country = ? THEN 1
                        WHEN gender = ? AND country = ? THEN 2
                        WHEN gender = ? THEN 3
                        ELSE 4 END`,
          {
            replacements: [age,
                           gender, 
                           country,
                           gender,
                           country,
                           gender
                         ],
            type: QueryTypes.SELECT
          }
        );

        res.status(201).send({success: true,count: result.length ,data: result});
    })
}

module.exports = new userController;
