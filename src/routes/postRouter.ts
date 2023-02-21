import {getPosts, createPost, updatePost, deleteComment, deletePost, addComment, likePost, unlikePost, likeComment, unlikeComment } from "../controllers/postController";
import { responseHandler, upload } from "../Helpers/imageHandler";
import { Router } from "express";
const postRouter = Router();

postRouter.get('/', getPosts)

postRouter.post('/create', createPost, upload.single("image"), responseHandler)

postRouter.patch('/update', updatePost, upload.single("image"), responseHandler)

postRouter.post('/like', likePost);

postRouter.post('/unlike', unlikePost);

postRouter.delete('/delete', deletePost);

postRouter.post('/comment/create', addComment);

postRouter.delete('/comment/delete', deleteComment);

postRouter.post('/comment/like', likeComment);

postRouter.post('/comment/unlike', unlikeComment);

export default postRouter