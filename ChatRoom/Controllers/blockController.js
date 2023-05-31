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
}

module.exports = new blockController();
