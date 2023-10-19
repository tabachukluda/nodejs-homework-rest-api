const express = require('express')

const authController = require('../../controllers/authControllers.js')

const authenticate = require('../../middlewares/authenticate.js')

const usersRouter = express.Router();

usersRouter.post("/register",  authController.register);

usersRouter.post("/login", authController.login);

usersRouter.get("/current", authenticate, authController.getCurrent);

usersRouter.post("/logout", authenticate, authController.logout);

module.exports = usersRouter