const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Client } = require("@elastic/elasticsearch");
const { User } = require("../Models/User");
const catchAsyncError = require("../Utilities/catchAsyncError");
const CustomError = require("../Utilities/customError");
const { dbSetup } = require("../Models/dbConnection");
const elastic = require("../Utilities/elasticSearch");

class userController {
  getUserData = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.query.userId, {
      attributes: {
        exclude: ["loginTime", "createdAt", "updatedAt", "password"],
      },
    });
    res.status(200).send(user);
  });

  saveUserData = catchAsyncError(async (req, res, next) => {
    const newUser = await User.create({ ...req.body });
    elastic.addDocument("users", newUser.name);
    res.status(201).send(newUser);
  });

  getAllUser = catchAsyncError(async (req, res, next) => {
    const userData = User.findAll()
      .then((res) => {
        console.log("Data of user", res);
        return res;
      })
      .catch((error) => {
        console.error("Failed to retrieve data : ", error);
      });

    return res.status(200).json({
      success: true,
      message: userData,
    });
  });
  //Filter api
  //age gender country

  filterUser = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIdx = (page - 1) * limit;
    let regionFilter = {
      India: ["India", "Pakistan", "Srilanka"],
      America: ["America", "UK", "Malaysia"],
      Japan: ["Japan", "China", "Korea"],
      Russia: ["Russia", "Korea", "China"],
      HongKong: ["HongoKong", "Switzerland", "Singapore"],
    };
    let sequelize = dbSetup("chatDB");
    const { gender, age, country } = req.body;
    sequelize
      .query(
        "SELECT * FROM Users WHERE gender=? AND age BETWEEN ? and ? AND country in (?) ORDER BY FIELD (country,?) LIMIT ?, ? ",
        {
          replacements: [
            gender,
            age - 10,
            age + 10,
            regionFilter[country],
            regionFilter[country],
            startIdx,
            limit,
          ],
        }
      )
      .then((result) => {
        if (result[0]) {
          res.send(result[0]);
        } else {
          const userData = User.findAll()
            .then((res) => {
              return res;
            })
            .catch((error) => {
              console.error("Failed to retrieve data : ", error);
            });
          return res.status(200).json({
            success: true,
            message: userData,
          });
        }
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
  });

  getContact = catchAsyncError(async (req, res, next) => {
    let sequelize = dbSetup("chatDB");
    sequelize
      .query("select contacts from Users where userId = ?", {
        replacements: [req.query.userId],
      })
      .then((result) => {
        let contactArray = result[0][0].contacts.split("#");
        sequelize
          .query("select name from Users where userId in (?)", {
            replacements: [contactArray],
          })
          .then((result2) => {
            res.send(result2[0]);
          });
      });
  });

  searchUser = catchAsyncError(async (req, res, next) => {
    console.log(elastic.addDocument("users", "atishay"));
    let prefixData = await elastic.prefixSearch("users", "atish");
    let fuzzyData = await elastic.fuzzySearch("users", "ati");

    return res.json({
      prefixResult: prefixData.hits.hits,
      fuzzyResult: fuzzyData.hits.hits,
    });
  });
}

module.exports = new userController();
