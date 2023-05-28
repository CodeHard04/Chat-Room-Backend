const { Router } = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");

const userRouter = Router();

userRouter.get("/", userController.getUserData);
userRouter.get("/contact", userController.getContact);
userRouter.get("/filter", userController.filterUser);
userRouter.get("/search", userController.searchUser);
module.exports = userRouter;
