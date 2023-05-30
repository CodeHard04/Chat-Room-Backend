const jwt = require("jsonwebtoken");
const catchAsyncError = require("../Utilities/catchAsyncError");
const CustomError = require("../Utilities/customError");
const redis = require("../Utilities/redis");
const logger = require("../Logger/logger");
class authentication {
  authenticate = catchAsyncError(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader)
      throw new CustomError("authToken isn't provided", 400);
    const authToken = authorizationHeader.split(" ")[1];
    if (!(await redis.tokenExists(authToken))) {
      return res.status(400).json({
        success: false,
        message: "Please login Again token Expires",
      });
    }
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    logger.info("authToken", authToken);
    jwt.verify(authToken, jwtSecretKey, function (err, decoded) {
      if (err) {
        throw new CustomError(err.message, 400);
      }
      if (decoded) {
        req.userData = decoded;
        next();
      } else {
        throw new CustomError("Invalid Authorization Token", 400);
      }
    });
  });
}

module.exports = new authentication();
