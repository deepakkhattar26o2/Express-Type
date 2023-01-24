import prisma from "../../prismaClient";
import { authDetails } from "./authController";
import { NextFunction, Request, Response } from "express";
import { Message } from "@prisma/client";
import { io } from "../../server";
import { CurrentUser } from "../../TypeDef";
const getMessages = async (req: Request, res: Response) => {
  const currUser: CurrentUser = authDetails(req);
  if (!req.query.roomId && !req.query.userId) {
    return res.status(400).json({ message: "Missing query" });
  }
  var messages: Message[] = [];
  if (req.query.roomId) {
    messages = await prisma.message.findMany({
      where: { roomId: Number(req.query.roomId), responseTo: null },
      include: {
        responses: true,
        responseTo: true,
        user: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    });
  }
  if (req.query.userId) {
    messages = await prisma.message.findMany({
      where: { OR: [{ receiverId: currUser.id }, { userId: currUser.id }] },
      include: {
        responses: true,
        user: { select: { id: true, userName: true } },
      },
    });
  }
  return res.status(200).json({ messages: messages || [] });
};

const sendMessage = (req: Request, res: Response, next: NextFunction) => {
  const body: any = req.query;
  console.log(body.threadId);
  if (!body.receiverId && !body.roomId && !body.body) {
    return res.status(400).json({ message: "Missing Parameters!" });
  }
  const currUser: CurrentUser = authDetails(req);
  prisma.message
    .create({
      data: {
        userId: currUser.id,
        receiverId: Number(body.receiverId) || null,
        body: String(body.body),
        roomId: Number(body.roomId) || null,
        threadId: Number(body.threadId) || null,
        attachment: Boolean(JSON.parse(body.attachment)) || false,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
          },
        },
        room: true,
        responseTo: true,
      },
    })
    .then((msg: Message) => {
      io.emit(`room-${msg.roomId}`);
      if (msg.attachment) {
        req.query.obj = JSON.stringify(msg);
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
