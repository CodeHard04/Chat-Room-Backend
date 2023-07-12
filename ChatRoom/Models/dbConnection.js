const mysql = require("mysql");
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
const logger = require("../Logger/logger");
dotenv.config();

const dbSetup = (dbName) => {
  const sequelize = new Sequelize(
    dbName,
    process.env.DATABASE_USER_NAME,
    process.env.DATABASE_PASSWORD,
    {
      // host: "database-1.cpxhclwvluez.us-east-1.rds.amazonaws.com",
      host: "database-1.ch0lwjx3nly9.eu-north-1.rds.amazonaws.com",
      port: process.env.DATABASE_PORT,
      dialectOptions: {
        ssl: "Amazon RDS",
      },
      dialect: "mysql",
    }
  );

  sequelize
    .authenticate()
    .then(() => {
      logger.info("Connection has been established successfully.");
    })
    .catch((error) => {
      logger.error("Unable to connect to the database: ", error);
    });

  return sequelize;
};

exports.sequelize = dbSetup("chatDB");
