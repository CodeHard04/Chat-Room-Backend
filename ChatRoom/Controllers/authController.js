const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../Models/User");
const redis = require("../Utilities/redis");
const elastic = require("../Utilities/elasticSearch");
const catchAsyncError = require("../Utilities/catchAsyncError");
const CustomError = require("../Utilities/customError");
const sendEmail = require("../Utilities/email");
const logger = require("../Logger/logger");
const messages = require("../Messages/message");
class authController {
  login = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.query.userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!user) {
      throw new CustomError("User not exist", 400);
    }
    bcrypt.compare(
      req.query.password.toString(),
      user.getDataValue("password"),
      async function (err, result) {
        if (err) {
          throw new CustomError(err.message, 400);
        }
        if (result) {
          let data = {
            time: Date.now(),
            userId: user.userId,
            name: user.name,
          };
          let jwtSecretKey = process.env.JWT_SECRET_KEY;
          const token = jwt.sign(data, jwtSecretKey);
          await redis.setToken(token);
          // await client.EXPIREAT(key, +payload.exp);
          const cookieOptions = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
          };
          if (process.env.NODE_ENV === "production")
            cookieOptions.secure = true;
          res.cookie("jwt", token, cookieOptions);
          return res.status(200).json({
            success: true,
            message: token,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Userid and password does not match",
          });
        }
      }
    );
  });

  saveUserData = catchAsyncError(async (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const newUser = await User.create({ ...req.body });
    let data = {
      time: Date.now(),
      userId: newUser.userId,
      name: newUser.name,
    };
    const token = jwt.sign(data, jwtSecretKey);
    await redis.setToken(token);
    elastic.addDocument("users", newUser.name);
    res.status(201).send(token);
  });

  logout = catchAsyncError(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const authToken = authorizationHeader.split(" ")[1];
    await redis.deleteToken(authToken);
    return res.status(200).json({
      success: true,
      message: messages.LOGOUT,
    });
  });

  forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ where: { email: req.query.email } });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: messages.ACCOUNT_NOT_FOUND,
      });
    }
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
      time: Date.now(),
      email: req.query.email,
    };
    const token = jwt.sign(data, jwtSecretKey);
    logger.debug("Token is", { token });
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${token}`;
    console.log({ resetUrl });
    const message = ` Reset password using this particular link ${resetUrl}`;
    await sendEmail({
      email: "2018pcecsatishay35@poornima.org",
      subject: "Your password token only valids for 10 min",
      message,
    });
    res.status(200).json({
      success: true,
      message: "A reset token sent to your mail id",
    });
  });

  resetPassword = catchAsyncError(async (req, res, next) => {
    jwt.verify(req.params.token, jwtSecretKey, function (err, decoded) {
      if (err) {
        throw new CustomError(err.message, 400);
      }
      console.log(decoded);
      if (decoded) {
        req.userData = decoded;
        next();
      } else {
        throw new CustomError("Invalid Authorization Token", 400);
      }
    });
    const user = await User.findOne({ where: { email: req.userData.email } });
    //Token expired or not to do
    if (!user) {
      return res.status(200).json({
        success: false,
        message:
          "User is not available please sign up or fogot password again...",
      });
    }
    await User.update(
      { password: req.body.password },
      { where: { userId: user.userId } }
    );
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
      time: Date.now(),
      userId: user.userId,
      name: user.name,
    };
    const token = jwt.sign(data, jwtSecretKey);
    await redis.setToken(token);
    res.status(201).send(token);
  });
}

module.exports = new authController();
