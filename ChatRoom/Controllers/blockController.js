var { sequelize } = require("../Models/dbConnection");
const catchAsyncError = require("../Utilities/catchAsyncError");

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
    console.log(req.userData.userId);
    console.log(req.query.unblockId);
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
    console.log(req.userData.userId);
    if (await this.checkBlockUser(req.userData.userId, req.query.blockId)) {
      res.status(200).json({
        success: true,
        message: "User is blocked",
      });
    }
    res.status(200).json({
      success: false,
      message: "User is not blocked",
    });
  });
}

module.exports = new blockController();
