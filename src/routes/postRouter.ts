import {getPosts, createPost, updatePost, deleteComment, deletePost, addComment } from "../controllers/postController";
import { upload } from "../Tools/imageHandler";
import { Router, Request, Response } from "express";
const postRouter = Router();

postRouter.get('/', getPosts)

postRouter.post('/create', createPost, upload.single("image"),
(req: Request, res: Response) => {
  if (req.query.obj) {
    let obj = JSON.parse(String(req.query.obj))
    return res.status(200).json({ message: obj });
  }  else {
    res.status(200).json({ message: "message sent" });
  }
})


postRouter.patch('/update', updatePost, upload.single("image"),
(req: Request, res: Response) => {
  if (req.query.obj) {
    let obj = JSON.parse(String(req.query.obj))
    return res.status(200).json({ message: obj });
  } else {
    res.status(200).json({ message: "message sent" });
  }
})

postRouter.delete('/delete', deletePost);

postRouter.post('/comment/create', addComment);

postRouter.delete('/comment/delete', deleteComment);

export default postRouter