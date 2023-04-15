const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../Models/User');
const catchAsyncError = require('../Utilities/catchAsyncError');
const CustomError = require('../Utilities/customError');
const { dbSetup } = require('../Models/dbConnection');

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
//Filter api
//age gender country 

    filterUser = catchAsyncError(async(req,res,next)=>{
        const page= parseInt(req.query.page) || 1;
        const limit= parseInt(req.query.limit) || 10;
        const startIdx = (page - 1)*limit;
        let regionFilter={
            "India":["India","Pakistan","Srilanka"],
            "America":["America","UK","Malaysia"],
            "Japan":["Japan","China","Korea"],
            "Russia":["Russia","Korea","China"],
            "HongKong":["HongoKong","Switzerland","Singapore"]
        }
        let sequelize=dbSetup("chatDB");
        const {gender,age,country} = req.body;
        sequelize.query(
          "SELECT * FROM Users WHERE gender=? AND age BETWEEN ? and ? AND country in (?) ORDER BY FIELD (country,?) LIMIT ?, ? ",{
            replacements: [gender,age-10,age+10,regionFilter[country],regionFilter[country],startIdx,limit],
          },
          ).then((result)=>{
          res.send(result[0]);
        });
        // const [results, metadata] =await sequelize.query(
        //     'SELECT * FROM Users'
        //     // {
        //     //   replacements: ['active'],
        //     //   type: QueryTypes.SELECT
        //     // }
        //   );
        //   console.log(results);
    //     User.findAll({
    //         where: {
    //             [Op.and]: [
    //                 {"gender":gender},
    //                 {"country":{
    //                     [Op.in]:this.regionFilter[country]
    //                     }
    //                 },
    //                 {"age":{
    //                     [Op.between]:[age-10,age+10]
    //                 }
    //             }]
    //         },
    //         attributes: ['userId','name','country','gender','age']
    //     }).then(result=>{
    //         res.send(result);
    //     })
    })

    getContact=catchAsyncError((req,res,next)=>{
        sequelize.query("select distinct(senderId),distinct(receiverId) from (select senderId, receiverId from Messages order by createdAt DESC) where senderId = ? || receiverId = ?")
    })
}

module.exports = new userController;
