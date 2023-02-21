import { Response } from "express";
type signupRequest = {
  email: string;
  password: string;
  userName: string;
  fullName: string;
};

type loginRequest = {
  email: string;
  password: string;
  userName: string;
};

type CurrentUser = {
  id: number;
  userName: string;
  bio: string;
  email: string;
  role: string;
  createdAt: string;
  iat: number;
};

type commentBody = {
  postId: number;
  body: string;
  threadId?: number;
};

type updatePostBody = {
  postId?: number;
  body?: string;
  attachment?: boolean;
  title?: string;
};

type createRoomBody = {
  roomName?: string;
  description?: string;
  topics?: string;
};


const errorResponse = (res : Response, err : Error) =>{
  return res.status(500).json({message : err.message});
}

export {
  signupRequest,
  loginRequest,
  CurrentUser,
  commentBody,
  updatePostBody,
  createRoomBody,
  errorResponse
};
