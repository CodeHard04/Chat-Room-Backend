var { sequelize } = require("./dbConnection");
const { DataTypes } = require("sequelize");
const { User } = require("../Models/User");

Message = sequelize.define("Message", {
  messageId: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  messageText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  key_from_me: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.beforeCreate((message) => {
  User.findByPk(message.receiverId, { attributes: ["contacts"] }).then(
    async (res) => {
      contactArray = res?.dataValues?.contacts?.split("#");
      let index = contactArray?.indexOf(message.senderId);
      if (index > -1) {
        contactArray.splice(index, 1);
      }
      let text =
        message?.senderId + (contactArray ? "#" + contactArray.join("#") : "");
      await User.update(
        {
          contacts: text,
        },
        {
          where: { userId: message.receiverId },
        }
      );
    }
  );
  User.findByPk(message.senderId, { attributes: ["contacts"] }).then(
    async (res) => {
      contactArray = res?.dataValues?.contacts?.split("#");
      let index = contactArray?.indexOf(message.receiverId);
      if (index > -1) {
        contactArray.splice(index, 1);
      }
      let text =
        message?.receiverId +
        (contactArray ? "#" + contactArray.join("#") : "");
      await User.update(
        {
          contacts: text,
        },
        {
          where: { userId: message.senderId },
        }
      );
    }
  );
});
exports.Message = Message;
