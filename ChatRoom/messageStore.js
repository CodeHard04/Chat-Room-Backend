const { Message } = require("./Models/Chat");
/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {}
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  async saveMessage(message) {
    // this.messages.push(message);
    if (await blockController.checkBlockUser(toId, fromId)) {
      return res.status(403).json({
        error: "Access denied. User is Blocked...",
      });
    }
    const fromId = message.from.toString();
    const toId = message.to;
    let reciever = true;
    if (fromId > toId) {
      reciever = false;
    }
    const data = {
      senderId: fromId,
      isRead: 0,
      key_from_me: reciever,
      receiverId: toId,
      messageText: message.updateMsg,
    };
    await Message.create(data);
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
