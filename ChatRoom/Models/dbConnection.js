const mysql = require('mysql'); 
const {Sequelize,DataTypes} = require("sequelize");

exports.dbSetup=(dbName)=>{
  sequelize = new Sequelize(
   dbName,
   'admin',
   '2023demo',
    {
      host: 'database-1.cpxhclwvluez.us-east-1.rds.amazonaws.com',
      port:3306,
      dialectOptions: {
        ssl:'Amazon RDS'
      },
      dialect: 'mysql'
    });

  sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });

// sequelize.sync().then(() => {
//  console.log('Book table created successfully!');

//   User.create({
//       userId:"1",
//       name: "CodeHater",
//       age:12,
//       gender:"Male",
//       loginTime: "2021-12-14",
//    }).then(res => {
//         console.log(res)
//   }).catch((error) => {
//       console.error('Failed to create a new record : ', error);
//   });

// }).catch((error) => {
//   console.error('Unable to create table : ', error);
// });
return sequelize;
}
// exports.dbSetup = (dbName) => { 
//     var db=mysql.createConnection({
//         host: "database-1.cpxhclwvluez.us-east-1.rds.amazonaws.com",
//         port: 3306,
//         user: "admin",
//         password: "2023demo",
//         database: dbName
//     });

//   db.connect((err)=>{
//     if(err){
//         console.log(err.message);
//         return;
//     }
//     console.log("DB connected");
//   })
// }