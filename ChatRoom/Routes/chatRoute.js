const { Router } = require("express");
const chatController = require("../Controllers/chatController");

const chatRouter = Router();

chatRouter.get("/",chatController.getChats);
chatRouter.post("/",chatController.saveChats);

module.exports = chatRouter;