import { verifyAuth, authDetails, CurrentUser } from "../controllers/authController";
import { createRoom, deleteRoom, getRooms, joinRoom, leaveRoom } from "../controllers/roomController";
import { Router, Request, Response } from "express";
import { upload } from "../Tools/imageHandler";
const roomRouter = Router();

roomRouter.get('/', getRooms);

roomRouter.post('/create', createRoom, upload.single("image"),
(req: Request, res: Response) => {
  if (req.query.obj) {
    let obj = JSON.parse(String(req.query.obj))
    return res.status(200).json({ room : obj });
  } else {
    res.status(200).json({ message: "room created!" });
  }});

roomRouter.post('/join', joinRoom);

roomRouter.post('/leave', leaveRoom);

roomRouter.delete('/delete', deleteRoom);

roomRouter.post('/', (req, res)=>{
    return res.json(authDetails(req))
})
export default roomRouter