import { authDetails, CurrentUser } from "./authController";
import e, { NextFunction, Request, Response } from "express";
import prisma from "../../prismaClient";
import { Post, Comment } from "@prisma/client";
import requestValidator from "../Tools/validator";

const createPost = (req: Request, res: Response, next: NextFunction) => {
  const body: any = req.query;
  const currUser: CurrentUser = authDetails(req);
  if (!body.title || !body.body) {
    return res.status(409).json({ message: "Missing Title or post body" });
  }
  prisma.post
    .create({
      data: {
        userId: currUser.id,
        attachment: Boolean(body.attachment) || false,
        body: body.body,
        title: body.title,
      },
    })
    .then((doc: Post) => {
      if (doc.attachment) {
        req.query.obj = JSON.stringify(doc)
        req.query.attachment = "post-"+String(doc.id)
        next();
      } else {
        return res.status(200).json({ post: doc });
      }
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const getPosts = async (req: Request, res: Response) => {
  if (!req.query.search && !req.query.user && !req.query.postId) {
    return res.status(409).json({ message: "missing key!" });
  }
  

  var posts: Post[] = [];
  var post : Post | null = null
  if (req.query.search) {
    posts = await prisma.post.findMany({
      where: { title: { contains: String(req.query.search) } },
      include: { comments: true },
    });
  } else if (req.query.user) {
    posts = await prisma.post.findMany({
      where: { userId: Number(req.query.user) },
      include: { comments: true },
    });
  } 
  else if (req.query.postId){
    post = await prisma.post.findFirst({
      where: { id: Number(req.query.postId) },
      include: { user: true, comments: true },
    });  
  }
  else {
    posts = await prisma.post.findMany();
  }
  if(req.query.postId){
    return res.status(200).json({ post: post });
  }
  else{
    return res.status(200).json({ posts: posts });
  }
};

interface updatePostBody {
  postId: number;
  body?: string;
  attachment?: boolean;
  title: string;
}

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.postId) {
    return res.status(409).json({ message: "missing post id" });
  }
  const body: updatePostBody = req.body;
  const currUser: CurrentUser = authDetails(req);
  const post: Post | null = await prisma.post.findFirst({
    where: { id: req.body.postId },
  });
  if (!post) {
    return res.status(409).json({ message: "post not found!" });
  }
  if (post.userId != currUser.id) {
    return res.status(409).json({ message: "You cannot update this post!" });
  }
  prisma.post
    .update({
      where: {
        id: post.id,
      },
      data: {
        body: body.body || post.body,
        attachment: body.attachment || post.attachment,
        title: body.title || post.title,
      },
    })
    .then((doc: Post) => {
      if(doc.attachment){
        req.query.obj = JSON.stringify(doc)
        req.query.attachment = "post-"+String(doc.id)
        next()
      }
      else{
        return res.status(200).json({post : doc});
      }
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const deletePost = async (req: Request, res: Response) => {
  if (!req.query.postId) {
    return res.status(409).json({ message: "missig post id!" });
  }
  const currUser: CurrentUser = authDetails(req);
  let post: Post | null = await prisma.post.findFirst({
    where: { id: Number(req.query.postId) },
  });
  if (!post) {
    return res.status(409).json({ message: "Post not found!" });
  }
  if (post.userId != currUser.id) {
    return res.status(409).json({ message: "You cannot delete this post!" });
  }
  prisma.post
    .delete({ where: { id: post.id } })
    .then((doc: Post) => {
      return res.status(200).json({ res: doc });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

interface commentBody {
  postId: number;
  body: string;
  threadId?: number;
}

const addComment = async (req: Request, res: Response) => {
  const fields: string[] = ["postId", "body", "threadId"];
  const currUser: CurrentUser = authDetails(req);
  const validator: [boolean, string] = requestValidator(req, fields);
  if (!validator[0]) {
    return res.status(409).json({ message: `missing ${validator[1]}` });
  }
  const body: commentBody = req.body;
  let post: Post | null = await prisma.post.findFirst({
    where: { id: body.postId },
  });
  if (!post) {
    return res.status(409).json({ message: "post not found" });
  }
  prisma.comment
    .create({
      data: {
        userId: currUser.id,
        postId: post.id,
        body: body.body,
        threadId: body.threadId || null,
      },
    })
    .then((doc: Comment) => {
      return res.status(200).json({ comm: doc });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const deleteComment = async (req: Request, res: Response) => {
  if (!req.query.commendId) {
    return res.status(409).json({ message: "missing comment id" });
  }
  const currUser: CurrentUser = authDetails(req);
  let comment: Comment | null = await prisma.comment.findFirst({
    where: { id: Number(req.query.commentId) },
  });
  if (!comment) {
    return res.status(409).json({ message: "comment not found!" });
  }
  if (comment.userId != currUser.id) {
    return res.status(409).json({ message: "cannot delete this comment!" });
  }
  prisma.comment
    .delete({ where: { id: comment.id } })
    .then((doc: Comment) => {
      return res.status(200).json({ res: doc });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

export {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
};
