import { Router } from "express";
import { confirmEmail, loginRequestHandler, signupRequestHandler, verifyAuth } from "../controllers/authController";
import {  updatePassword } from "../controllers/userController";
const userRouter = Router();

userRouter.post('/signup', signupRequestHandler)

userRouter.post('/login', loginRequestHandler)

userRouter.patch('/changePassword',verifyAuth, updatePassword)

userRouter.post('/test', confirmEmail)

export default userRouter;