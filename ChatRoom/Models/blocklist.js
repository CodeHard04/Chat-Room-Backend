var { sequelize } = require("./dbConnection");
const { DataTypes } = require("sequelize");

BlockedUser = sequelize.define("BlockedUser", {
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blockId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

exports.BlockedUser = BlockedUser;
