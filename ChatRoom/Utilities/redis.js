const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();
class redisContr {
  constructor() {
    this.client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });
    this.client.on("connect", (err) => {
      console.log("Client connected to Redis...");
    });
    this.client.on("ready", (err) => {
      console.log("Redis ready to use");
    });
    this.client.on("error", (err) => {
      console.error("Redis Client", err);
    });
    this.client.on("end", () => {
      console.log("Redis disconnected successfully");
    });
    this.client.connect();
  }
  setToken(token) {
    return new Promise(async (resolve) => {
      const data = await this.client.set(token, 1);
      resolve(data);
    });
  }

  getToken(token) {
    return new Promise(async (resolve) => {
      const data = await this.client.get(token);
      resolve(data);
    });
  }

  deleteToken(token) {
    return new Promise(async (resolve) => {
      const data = await this.client.del(token);
      resolve(data);
    });
  }

  isConnected() {
    if (!this.client.isReady) {
      return false;
    }
    return true;
  }

  tokenExists(token) {
    return new Promise(async (resolve) => {
      const data = await this.client.EXISTS(token);
      resolve(data);
    });
  }
}

module.exports = new redisContr();
