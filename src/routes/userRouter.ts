import { Router } from "express";
import { authTest, loginRequestHandler, signupRequestHandler, verifyAuth } from "../controllers/authController";
import { updatePassword, updateProfile, followUser, removeFollower, getActivities, getUser } from "../controllers/userController";

const userRouter = Router();

userRouter.get('/', getUser)

userRouter.post('/signup', signupRequestHandler)

userRouter.post('/login', loginRequestHandler)

userRouter.patch('/update', updateProfile)

userRouter.patch('/changePassword',verifyAuth, updatePassword)

userRouter.post('/follow', followUser)

userRouter.post('/unfollow', removeFollower)

userRouter.get('/activity', getActivities)

export default userRouter;