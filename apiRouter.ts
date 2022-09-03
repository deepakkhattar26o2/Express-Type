import { Router } from "express";
import userRouter from "./src/routes/userRouter";
const apiRouter = Router();

apiRouter.use('/user', userRouter)

export default apiRouter;