var { sequelize } = require("../Models/dbConnection");
const catchAsyncError = require("../Utilities/catchAsyncError");
const axios = require('axios');


class blockController {
  blockUser = catchAsyncError(async (req, res, next) => {
    const blockId = req.query.blockId;
    const userId = req.userData.userId;
    await sequelize.query(
      "INSERT INTO BlockedUsers (userId,blockId) Values (?,?)",
      {
        replacements: [userId, blockId],
      }
    );
    res.status(200).json({
      message: "User blocked Successfully",
    });
  });

  async checkBlockUser(userId, blockId) {
    const [result] = await sequelize.query(
      "SELECT * FROM BlockedUsers where userId = ? AND blockId = ?",
      {
        replacements: [userId, blockId],
      }
    );
    if (result.length > 0) {
      return true;
    }
    return false;
  }

  unblockUser = catchAsyncError(async (req, res, next) => {
    await sequelize.query(
      "DELETE FROM BlockedUsers where userId = ? and blockId = ?",
      {
        replacements: [req.userData.userId, req.query.unblockId],
      }
    );
    return res.status(200).json({
      message: "User unblocked successfully",
    });
  });

  blockStatus = catchAsyncError(async (req, res, next) => {
    if (await this.checkBlockUser(req.userData.userId, req.query.blockId)) {
      res.status(200).json({
        success: true,
        isblock: true,
        message: "User is blocked",
      });
    }
    res.status(200).json({
      success: true,
      isblock: false,
      message: "User is not blocked",
    });
  });

  verifyCaptcha = async (req,res) =>{

    try{

        axios({
            method: "POST",
            url: "https://www.google.com/recaptcha/api/siteverify",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.token}`,
          })
            .then((response) => {
              // Handle successful response
              console.log(response.data.success);
          res.status(201).send({ success:response.data && response.data.success})

            })
            .catch((error) => {
              // Handle error
              console.error(error);
          res.status(200).send({ success:false})

            });    

        //   res.status(201).send({ success:true})
    }catch(err){
        console.log(err,"########### ERROR")
        res.status(200).send({success:false})
    }
}
}

module.exports = new blockController();
