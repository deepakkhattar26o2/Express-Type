import {getPosts, createPost, updatePost, deleteComment, deletePost, addComment } from "../controllers/postController";
import { responseHandler, upload } from "../Tools/imageHandler";
import { Router } from "express";
const postRouter = Router();

postRouter.get('/', getPosts)

postRouter.post('/create', createPost, upload.single("image"), responseHandler)

postRouter.patch('/update', updatePost, upload.single("image"), responseHandler)

postRouter.delete('/delete', deletePost);

postRouter.post('/comment/create', addComment);

postRouter.delete('/comment/delete', deleteComment);

export default postRouter