import { Router } from "express";
import { loginRequestHandler, signupRequestHandler, verifyAuth } from "../controllers/authController";
import { updatePassword, updateProfile, followUser, removeFollower, getActivities, getUser } from "../controllers/userController";
import { responseHandler, upload } from "../Tools/imageHandler";

const userRouter = Router();

userRouter.get('/', getUser)

userRouter.post('/signup', signupRequestHandler)

userRouter.post('/login', loginRequestHandler)

userRouter.patch('/update', updateProfile,upload.single('image'), responseHandler )

userRouter.patch('/changePassword',verifyAuth, updatePassword)

userRouter.post('/follow', followUser)

userRouter.post('/unfollow', removeFollower)

userRouter.get('/activity', getActivities)

export default userRouter;