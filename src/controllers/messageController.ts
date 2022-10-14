import prisma from "../../prismaClient";
import { authDetails, CurrentUser } from "./authController";
// import requestValidator from "../Tools/validator";
import { NextFunction, Request, Response } from "express";
import { Message } from "@prisma/client";

const getMessages = async (req: Request, res: Response) => {
  const currUser: CurrentUser = authDetails(req);
  if (!req.query.roomId && !req.query.userId) {
    return res.status(409).json({ message: "Missing query" });
  }
  var messages: Message[] = [];
  if (req.query.roomId) {
    messages = await prisma.message.findMany({
      where: { roomId: Number(req.query.roomId) },
      include: { responses: true },
    });
  }
  if (req.query.userId) {
    messages = await prisma.message.findMany({
      where: { OR: [{ receiverId: currUser.id }, { userId: currUser.id }] },
      include: { responses: true },
    });
  }
  return res.status(200).json({ messages: messages || [] });
};

const sendMessage = (req: Request, res: Response, next: NextFunction) => {
  const body: any = req.query;
  if (!body.receiverId && !body.roomId && !body.body) {
    return res.status(409).json({ message: "Missing Parameters!" });
  }
  const currUser: CurrentUser = authDetails(req);
  prisma.message
    .create({
      data: {
        userId: currUser.id,
        receiverId: body.receiverId || null,
        body: body.body,
        roomId: Number(body.roomId) || null,
        threadId: body.threadId || null,
        attachment: Boolean(body.attachment) || false,
      },
      include: {
        user: true,
        room: true,
        responses: true,
        responseTo: true,
      },
    })
    .then((msg: Message) => {
      if (msg.attachment) {
        req.query.obj  = JSON.stringify(msg)
        req.query.attachment = "message-" + String(msg.id);
        next();
      } else {
        return res.status(200).json({ message: msg });
      }
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const deleteMessage = async (req: Request, res: Response) => {
  const currUser: CurrentUser = authDetails(req);
  if (!req.body.messageId) {
    return res.status(500).json({ message: "message id missing" });
  }
  let message = await prisma.message.findFirst({
    where: { id: req.body.messageId },
  });
  if (!message || message.userId != currUser.id) {
    return res.status(409).json({ message: "Cannot delete this message!" });
  }
  prisma.message
    .delete({ where: { id: message.id } })
    .then((doc) => {
      return res
        .status(200)
        .json({ resp: doc, message: "message deleted successfully" });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

export { sendMessage, getMessages, deleteMessage };
