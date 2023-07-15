const blockController = require("./Controllers/blockController");
const { Message } = require("./Models/Chat");
const { sequelize } = require("./Models/dbConnection");
/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {}
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  async saveMessage(message, isSeen) {
    // this.messages.push(message);
    const fromId = message.from?.toString();
    const toId = message.to;
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
      isRead: isSeen ? 1: 0,
      key_from_me: reciever,
      receiverId: toId,
      messageText: message.updateMsg,
    };
    await sequelize.query("Insert into Messages (senderId, isRead, key_from_me, receiverId, messageText) VALUES (?,?,?,?,?)", {replacements: {...data}})
  }

  // findMessagesForUser(userID) {
  //   return this.messages.filter(
  //     ({ from, to }) => from === userID || to === userID
  //   );
  // }
}

module.exports = {
  InMemoryMessageStore,
};
