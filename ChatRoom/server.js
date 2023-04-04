const express = require('express');
const dotenv = require('dotenv');

//import  route haandlers
const {dbSetup} = require('./Models/dbConnection');
const {User} = require('./Models/User');
const globalErrorHandler = require('../ChatRoom/Middlewares/errorHandler');
const userRouter = require('./Routes/userRoute');

const app = express();

dotenv.config();
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.json());

app.use("/",userRouter);

app.use(function (req, res, next) {
  next(new CustomError("Invalid Route", 404));
});

app.use(globalErrorHandler);

app.listen(5000,()=>{ 
    dbSetup("chatDB");
    console.log("Listening at port 5000")
    sequelize.sync().then(() => {

        User.findAll().then(res => {
            console.log("Data of user",res)
        }).catch((error) => {
            console.error('Failed to retrieve data : ', error);
        });
      
      }).catch((error) => {
        console.error('Unable to create table : ', error);
      });
});

module.exports = app;