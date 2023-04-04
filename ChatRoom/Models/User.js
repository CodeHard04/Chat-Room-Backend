var {dbSetup} = require('./dbConnection');
const {DataTypes} = require("sequelize");
const bcrypt = require ('bcryptjs');
const {validatePassword} = require('../Utilities/validators');
const CustomError = require('../Utilities/customError');
var sequelize=dbSetup("chatDB");

User=sequelize.define(
    "User",
    {
      userId:{
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true
      },
      name:{
        type: DataTypes.STRING,
        allowNull: false
      },
      age:{
        type: DataTypes.INTEGER,
        allowNull: true
      },
      gender:{
        type:DataTypes.ENUM("Male","Female"),
        allowNull: true
      },
      country:{
        type: DataTypes.STRING,
        allowNull: true
      },
      userType:{
        type: DataTypes.ENUM("Admin","Anonymous","LoggedIn"),
        allowNull: true
      },
      email:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        } 
      },
      loginTime:{
        type: DataTypes.TIME,
        allowNull: false
      },
      password:{
        type:DataTypes.STRING,
        allowNull:true
      }
    })
User.beforeCreate(user => {
  const errorMsg=validatePassword(user.password);
  if(errorMsg){
    throw new CustomError(errorMsg,400);
  }
  const salt=bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(user.getDataValue('password'),salt);
  user.setDataValue('password',hash);
  // bcrypt
  // .genSalt(5)
  // .then(salt => {
  //   console.log(`Salt: ${salt}`);
  //   hash = bcrypt.hash(user.getDataValue('password'), salt);
  // })
  // .then(hash => {
  //   console.log(`Hash: ${hash}`);
  //   // Store hash in your password DB.
  //   user.setDataValue('password',hash);
  // }).catch(err => console.error(err.message));
});

exports.User=User;