var {dbSetup} = require('./dbConnection');
const {DataTypes} = require("sequelize");

var sequelize=dbSetup("chatDB");

Message=sequelize.define(
    "Message",
    {
      messageId:{
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true
      },
      messageText:{
        type: DataTypes.STRING,
        allowNull: false
      },
      isRead:{
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      key_from_me:{
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      senderId:{
        type: DataTypes.STRING,
        allowNull: false 
      },
      receiverId:{
        type: DataTypes.STRING,
        allowNull: false
      }
    })
exports.Message=Message;