const { Router } = require("express");
const preferenceController = require("../Controllers/preferenceController");

const preferenceRouter = Router();

preferenceRouter.get("/",preferenceController.getPreference);
preferenceRouter.post("/",preferenceController.savePreference);

module.exports = preferenceRouter;