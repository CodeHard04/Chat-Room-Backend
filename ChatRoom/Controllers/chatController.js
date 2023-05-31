const { Sequelize } = require("sequelize");
const { Message } = require("../Models/Chat");
var { sequelize } = require("../Models/dbConnection");
const messages = require("../Messages/message");
const catchAsyncError = require("../Utilities/catchAsyncError");
const blockController = require("./blockController");

class chatController {
  getChats = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIdx = (page - 1) * limit;
    const fromId = req.userData.userId;
    const toId = req.query.to;
    let reciever = 1;
    if (fromId > toId) {
      reciever = 0;
    }
    sequelize
      .query(
        "select messageText,key_from_me from Messages where senderId in (?,?) and receiverId in (?,?) order by createdAt DESC LIMIT ?,?",
        {
          replacements: [fromId, toId, fromId, toId, startIdx, limit],
        }
      )
      .then((result) => {
        return res.status(200).json({
          result: result[0],
          receiverKey: reciever,
        });
      });
  });

  saveChats = catchAsyncError(async (req, res, next) => {
    const fromId = req.userData.userId.toString();
    const toId = req.body.receiverId;
    if (await blockController.checkBlockUser(toId, fromId)) {
      return res.status(403).json({
        error: "Access denied. User is Blocked...",
      });
    }
    let reciever = true;
    if (fromId > toId) {
      reciever = false;
    }
    const data = {
      senderId: fromId,
      isRead: 0,
      key_from_me: reciever,
      ...req.body,
    };
    await Message.create(data);
    return res.status(201).json({
      success: true,
      message: messages.SAVE_CHAT,
    });
  });
}

module.exports = new chatController();
