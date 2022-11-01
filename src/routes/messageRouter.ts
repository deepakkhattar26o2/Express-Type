import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import {responseHandler, upload} from "../Tools/imageHandler";
const messageRouter = Router();

messageRouter.get('/', getMessages);

messageRouter.post('/send', sendMessage, upload.single('image'), responseHandler);

export default messageRouter;