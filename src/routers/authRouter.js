const express = require("express");
const authControllers = require("../controllers/authControllers");
const authRouter = express.Router();

authRouter.post("/sign-up", authControllers.createUser);
authRouter.post("/sign-in", authControllers.loginUser);
authRouter.post("/refresh-token", authControllers.refreshToken);
authRouter.post("/verification", authControllers.verification);
authRouter.post("/forgotPassword", authControllers.forgotPassword);

authRouter.post("/sign-with-google", authControllers.handleLoginWithGoogle);

module.exports = authRouter;
