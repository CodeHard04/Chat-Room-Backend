var {dbSetup} = require('./dbConnection');
const {DataTypes} = require("sequelize");
const { User } = require('../Models/User');

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

    Message.beforeCreate(message => {
      User.findByPk(message.receiverId,{attributes:["contacts"]}).then(async(res)=>{
        console.log("contact",res?.dataValues?.contacts)
        if(!res?.dataValues?.contacts){
          await User.update(
            {
              contacts: message.receiverId
            },
            {
              where: { userId: message.receiverId },
            }
          );
        }else{
          contactArray=res?.dataValues?.contacts?.split("#");
          let index = contactArray.indexOf(message.receiverId);
          if (index > -1) {
            contactArray.splice(index, 1);
          }
          let text = message?.receiverId+"#"+contactArray.join("#");
          const updatedRows = await User.update(
            {
              contacts: text
            },
            {
              where: { userId: message.receiverId },
            });
        }
      });
    });
exports.Message=Message;