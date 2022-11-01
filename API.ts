import { Router, Request, Response } from "express";
import messageRouter from "./src/routes/messageRouter";
import postRouter from "./src/routes/postRouter";
import roomRouter from "./src/routes/roomRouter";
import userRouter from "./src/routes/userRouter";
import {imagePath} from "./src/Tools/imageHandler";

const apiRouter = Router();

apiRouter.use('/user', userRouter);

apiRouter.use('/room', roomRouter);
  
apiRouter.use('/message', messageRouter);

apiRouter.use('/post', postRouter);

apiRouter.get("/image/:name",  (req : Request, res : Response) =>{
    res.sendFile(imagePath(req.params.name||"default"))
});

export default apiRouter;