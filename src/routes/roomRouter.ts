import { createRoom, deleteRoom, getRooms, joinRoom, leaveRoom } from "../controllers/roomController";
import { Router} from "express";
import { responseHandler, upload } from "../Tools/imageHandler";
const roomRouter = Router();

roomRouter.get('/', getRooms);

roomRouter.post('/create', createRoom, upload.single("image"), responseHandler);

roomRouter.post('/join', joinRoom);

roomRouter.post('/leave', leaveRoom);

roomRouter.delete('/delete', deleteRoom);

export default roomRouter