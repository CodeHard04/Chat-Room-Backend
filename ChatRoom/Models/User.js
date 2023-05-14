var { dbSetup } = require("./dbConnection");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../Utilities/validators");
const CustomError = require("../Utilities/customError");
var sequelize = dbSetup("chatDB");

User = sequelize.define("User", {
  userId: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female"),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userType: {
    type: DataTypes.ENUM("Admin", "Anonymous", "LoggedIn"),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contacts: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
User.beforeCreate((user) => {
  if (user?.password) {
    const errorMsg = validatePassword(user.password);
    if (errorMsg) {
      throw new CustomError(errorMsg, 400);
    }
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.getDataValue("password"), salt);
    user.setDataValue("password", hash);
  } else {
    user.setDataValue("password", "");
  }
});

exports.User = User;
