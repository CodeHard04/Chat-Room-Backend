const { Sequelize } = require("sequelize");
const { Message } = require("../Models/Chat");
var {dbSetup} = require('../Models/dbConnection');
const catchAsyncError = require('../Utilities/catchAsyncError');

class chatController {

    getChats = catchAsyncError(async(req,res,next)=>{
        const page= parseInt(req.query.page) || 1;
        const limit= parseInt(req.query.limit) || 10;
        const startIdx = (page - 1)*limit;
        const fromId = req.query.from;
        const toId = req.query.to;
        let sequelize=dbSetup("chatDB");
        let reciever=1;
        if(fromId>toId){
            reciever=0;
        }
        sequelize.query("select messageText,key_from_me from Messages where senderId in (?,?) and receiverId in (?,?) order by createdAt DESC LIMIT ?,?",{
            replacements:[fromId,toId,fromId,toId,startIdx,limit]
        }).then(result=>{
            return res.status(200).json({
                result:result[0],
                receiverKey:reciever
            });
        })
    })

    saveChats = catchAsyncError(async(req,res,next)=>{
        const fromId = req.userData.userId
        const toId = req.body.receiverId;
        let reciever=true;
        if(fromId>toId){
            reciever=false;
        }
        const data={"senderId":fromId,"isRead":0,"key_from_me":reciever,...req.body}
        // console.log("data",data);
        const newMessage = await Message.create(data)
        return res.status(201).json({
            success:true
        });
    })

}

module.exports = new chatController;