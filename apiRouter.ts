import { Router } from "express";
import messageRouter from "./src/routes/messageRouter";
import postRouter from "./src/routes/postRouter";
import roomRouter from "./src/routes/roomRouter";
import userRouter from "./src/routes/userRouter";
const apiRouter = Router();

apiRouter.use('/user', userRouter);

apiRouter.use('/room', roomRouter);

apiRouter.use('/message', messageRouter);

apiRouter.use('/post', postRouter);

export default apiRouter;