const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// const compression = require("compression");
const cookieParser = require("cookie-parser");
//import  route haandlers
const { User } = require("./Models/User");
const globalErrorHandler = require("../ChatRoom/Middlewares/errorHandler");
const userRouter = require("./Routes/userRoute");
const preferenceRouter = require("./Routes/preferenceRoute");
const authentication = require("./Middlewares/authentication");
const authController = require("./Controllers/authController");
const userController = require("./Controllers/userController");
const CustomError = require("./Utilities/customError");
const chatRouter = require("./Routes/chatRoute");
const jwt = require("jsonwebtoken");
const http = require("http");
const logger = require("./Logger/logger");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
var corsOptions = {
  origin: "https://basic-chat-room.vercel.app",
  optionsSuccessStatus: true,
  credentials: true,
};

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://basic-chat-room.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// compress all responses
// app.use(compression());
const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryMessageStore } = require("./messageStore");
// const userController = require("./Controllers/userController");
const messageStore = new InMemoryMessageStore();

app.use(helmet());
dotenv.config();
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this ip please try again in an hour",
// });
// app.use("/", limiter);
app.use(cookieParser());
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_SOCKET_URL,
  },
});

app.use(express.json());
app.post("/signup", authController.saveUserData);
app.get("/login", authController.login);
app.post("/forgotPassword", authController.forgotPassword);
app.patch("/resetPassword/:token", authController.resetPassword);
app.get("/uniqueName", userController.getUniqueUsername);
app.use(authentication.authenticate);
app.use("/logout", authController.logout);
app.use("/user", userRouter);
app.use("/preference", preferenceRouter);
app.use("/chat", chatRouter);
app.use(function (req, res, next) {
  next(new CustomError("Invalid Route", 404));
});

app.use(globalErrorHandler);

server.listen(process.env.PORT, () => {
  logger.info("Server is running on port 5000");
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
    const data = jwt.verify(sessionID, process.env.JWT_SECRET_KEY);
    if (!data) {
      return next(new Error("invalid username"));
    }

    // To create new session
    socket.sessionID = sessionID;
    socket.userID = data.userId;
    socket.username = data.name;
    next();
  }
});
let globalSocket = null;

io.on("connection", (socket) => {

  const chatCon = require('./Controllers/chatController');
  chatCon.chatSocket(io)
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

  logger.info("connected!!", socket.userID);
  // fetch existing users
  const users = [];
  // const messagesPerUser = new Map();
  // messageStore.findMessagesForUser(socket.userID).forEach((message) => {
  //   const { from, to } = message;
  //   const otherUser = socket.userID === from ? to : from;
  //   if (messagesPerUser.has(otherUser)) {
  //     messagesPerUser.get(otherUser).push(message);
  //   } else {
  //     messagesPerUser.set(otherUser, [message]);
  //   }
  // });
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      // messages: messagesPerUser.get(session.userID) || [],
    });
  });
  socket.emit("users", users);

  // notify existing users
  // socket.broadcast.emit("user connected", {
  //   userID: socket.userID,
  //   username: socket.username,
  //   users,
  // }); 

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private-message", ({ updateMsg, to }, callback) => {
    const message = {
      updateMsg,
      from: socket.userID,
      to,
    };
    console.log(message, "message123");
    socket.to(to).to(socket.userID).timeout(5000).emit("private-message", message, (err, isSeen) => {      
      callback(isSeen)
      console.log(message,"*************************asxzssssss")
      messageStore.saveMessage(message, isSeen[0] ?? false);
    });
  });

  socket.on("connect_error", (data) => {
    logger.error(data, "888888888888 connect_error");
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
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

// module.exports = app;
module.exports = {app, globalSocket};
