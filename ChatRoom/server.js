const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
//import  route haandlers
const { dbSetup } = require("./Models/dbConnection");
const { User } = require("./Models/User");
const globalErrorHandler = require("../ChatRoom/Middlewares/errorHandler");
const userRouter = require("./Routes/userRoute");
const preferenceRouter = require("./Routes/preferenceRoute");
const authentication = require("./Middlewares/authentication");
const authController = require("./Controllers/authController");
const CustomError = require("./Utilities/customError");
const chatRouter = require("./Routes/chatRoute");
const app = express();
app.use(cors());

app.use(helmet());
dotenv.config();
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many rquest from thi ip please try again in a hour",
});
app.use("/", limiter);
app.use(express.json());

app.post("/signup", authController.saveUserData);
app.get("/login", authController.login);
app.post("/forgotPassword", authController.forgotPassword);
app.patch("/resetPassword/:token", authController.resetPassword);

app.use(authentication.authenticate);
app.use("/logout", authController.logout);
app.use("/user", userRouter);
app.use("/preference", preferenceRouter);
app.use("/chat", chatRouter);
app.use(function (req, res, next) {
  next(new CustomError("Invalid Route", 404));
});

app.use(globalErrorHandler);

app.listen(5000, () => {
  dbSetup("chatDB");
  console.log("Listening at port 5000");
  // sequelize.sync().then(() => {

  //     User.findAll().then(res => {
  //         console.log("Data of user",res)
  //     }).catch((error) => {
  //         console.error('Failed to retrieve data : ', error);
  //     });

  //   }).catch((error) => {
  //     console.error('Unable to create table : ', error);
  //   });
});

module.exports = app;
