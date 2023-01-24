import { Router } from "express";
import { confirmEmail, loginRequestHandler, signupRequestHandler, verifyAuth } from "../controllers/authController";
import { updatePassword, updateProfile, followUser, removeFollower, getActivities, getUser } from "../controllers/userController";
import { responseHandler, upload } from "../Helpers/imageHandler";

const userRouter = Router();

userRouter.get('/',verifyAuth, getUser)

userRouter.get('/verify', confirmEmail)

userRouter.post('/signup', signupRequestHandler)

userRouter.post('/login', loginRequestHandler)

userRouter.patch('/update',verifyAuth, updateProfile,upload.single('image'), responseHandler )

userRouter.patch('/changePassword',verifyAuth, updatePassword)

userRouter.post('/follow',verifyAuth, followUser)

userRouter.post('/unfollow',verifyAuth, removeFollower)

userRouter.get('/activity', verifyAuth,getActivities)

export default userRouter;