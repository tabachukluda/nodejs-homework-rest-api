const express = require('express')

const authController = require('../../controllers/authControllers.js')

const authenticate = require('../../middlewares/authenticate.js')

const { upload }  = require('../../middlewares/uploadAvatar.js')

const usersRouter = express.Router();

usersRouter.post("/register", authController.register);

usersRouter.get("/verify/:verificationToken", authController.verify);

usersRouter.post("/verify", authController.resendVerifyEmail);

usersRouter.post("/login", authController.login);

usersRouter.get("/current", authenticate, authController.getCurrent);

usersRouter.post("/logout", authenticate, authController.logout);

usersRouter.patch("/avatars", authenticate, upload.single("avatar"), authController.updateAvatar);


module.exports = usersRouter