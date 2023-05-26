const { createLogger, transports } = require("winston");
const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console(),
    new transports.File({ filename: "Logger/app.log" }),
  ],
});
module.exports = logger;
