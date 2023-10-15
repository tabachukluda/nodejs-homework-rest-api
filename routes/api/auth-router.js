const express = require('express')

const authController = require('../../controllers/authControllers.js')

const authenticate = require('../../middlewares/authenticate.js')

const authRouter = express.Router()

authRouter.post("/register",  authController.register);

authRouter.post("/login", authController.login);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logout);

module.exports = authRouter