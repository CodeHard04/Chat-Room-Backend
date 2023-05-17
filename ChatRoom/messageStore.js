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
    const fromId = message.from;
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
    console.log("data", data);
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
