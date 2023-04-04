const { Router } = require("express");
const userController = require("../Controllers/userController");

const userRouter = Router();

userRouter.get("/user",userController.getUserData);
userRouter.post("/getfilterdata",userController.getFilterData)
userRouter.post("/user",userController.saveUserData);

module.exports = userRouter;