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
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
app.use(cors());

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryMessageStore } = require("./messageStore");
const messageStore = new InMemoryMessageStore();

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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

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

server.listen(5000, () => {
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

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.name;
      return next();
    }
  }
  const data = jwt.verify(sessionID, process.env.JWT_SECRET_KEY);
  console.log(data, "%%%%%%%% data");
  if (!data) {
    return next(new Error("invalid username"));
  }

  // To create new session
  socket.sessionID = sessionID;
  socket.userID = data.userId;
  socket.username = data.name;
  next();
});

io.on("connection", (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  console.log("connected!!", socket.userID);
  // fetch existing users
  const users = [];
  const messagesPerUser = new Map();
  messageStore.findMessagesForUser(socket.userID).forEach((message) => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    users,
  });

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private-message", ({ updateMsg, to }) => {
    const message = {
      updateMsg,
      from: socket.userID,
      to,
    };
    socket.to(to).to(socket.userID).emit("private-message", message);
    messageStore.saveMessage(message);
  });

  socket.on("connect_error", (data) => {
    console.log(data, "888888888888 connect_error");
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    console.log(matchingSockets, "-----------matchingSockets");
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

module.exports = app;
