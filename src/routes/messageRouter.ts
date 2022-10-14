import { Router, Request, Response } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import {upload} from "../Tools/imageHandler";
const messageRouter = Router();

messageRouter.get('/', getMessages);

messageRouter.post('/send', sendMessage, upload.single('image'), (req : Request, res : Response)=>{
    if(req.query.obj){
        let obj = JSON.parse(String(req.query.obj))
        res.status(200).json({message : obj})
    }
    else{    
        res.status(200).json({message : "message sent"})
    }
});

export default messageRouter;