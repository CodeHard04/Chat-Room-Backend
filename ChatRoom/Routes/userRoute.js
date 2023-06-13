const { Router } = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");
const blockController = require("../Controllers/blockController");

const userRouter = Router();

userRouter.get("/", userController.getUserData);
userRouter.get("/uniqueName", userController.getUniqueUsername);
userRouter.get("/contact", userController.getContact);
userRouter.get("/filter", userController.filterUser);
userRouter.get("/search", userController.searchUser);
userRouter.post("/block", blockController.blockUser);
userRouter.post("/unblock", blockController.unblockUser);
userRouter.get("/checkblock", blockController.blockStatus);
module.exports = userRouter;
