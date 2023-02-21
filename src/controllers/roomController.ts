import { Room, Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../prismaClient";
import { authDetails } from "./authController";
import requestValidator from "../Helpers/validator";
import { io } from "../../server";
import { CurrentUser, createRoomBody, errorResponse } from "../../TypeDef";

const getRooms = async (req: Request, res: Response) => {
  var rooms: Room[] = [];
  if (req.query.user) {
    rooms = await prisma.room.findMany({
      where: { hostId: Number(req.query.user) },
    });
  } else if (req.query.search) {
    rooms = await prisma.room.findMany({
      where: {
        OR: [
          { roomName: { contains: String(req.query.search) } },
          { topics: { has: String(req.query.search) } },
        ],
      },
      include: {
        host: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            bio: true,
            password: false,
          },
        },
        members: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            bio: true,
            password: false,
          },
        },
      },
    });
  } else if (req.query.roomId) {
    let room = await prisma.room.findFirst({
      where: { id: Number(req.query.roomId) },
      select: {
        id: true,
        roomName: true,
        description: true,
        host: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            bio: true,
            password: false,
          },
        },
        members: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            bio: true,
            password: false,
          },
        },
      },
    });
    return res.status(200).json({ room: room });
  } else {
    rooms = await prisma.room.findMany();
  }
  return res.status(200).json({ rooms: rooms });
};

const deleteRoom = async (req: Request, res: Response) => {
  if (!req.body.roomId) {
    return res.status(500).json({ message: "Missing Room ID!" });
  }
  const roomId: number = req.body.roomId;
  const currUser: CurrentUser = authDetails(req);
  let room: Room | null = await prisma.room.findFirst({
    where: { id: roomId },
  });
  if (!room) {
    return res.status(409).json({ message: "Room Doesn't Exist!" });
  }
  if (room.hostId != currUser.id && currUser.role == Role.USER) {
    return res
      .status(409)
      .json({ message: "Only Admin can perform this action!" });
  }
  await prisma.room.delete({ where: { id: roomId } });
  return res.status(200).json({ message: "Room deleted Successfully" });
};

const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  const currUser: CurrentUser = authDetails(req);
  const body: createRoomBody = req.query;
  if (!body.roomName || !body.topics) {
    return res.status(409).json({ message: "Missing required keys!" });
  }
  let topics = body.topics.replace(/\s/g, "").split(",");
  prisma.room
    .create({
      data: {
        roomName: body.roomName,
        description: body.description,
        hostId: currUser.id,
        topics: topics,
      },
      include: {
        host: {
          select: {
            id: true,
            userName: true,
          },
        },
        messages: true,
        members: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    })
    .then((roomData: Room) => {
      req.query.attachment = "room-" + String(roomData.id);
      req.query.obj = JSON.stringify(roomData);
      next();
    })
    .catch((err: Error) => {
      return errorResponse(res, err);
    });
};
const joinRoom = async (req: Request, res: Response) => {
  const fields: string[] = ["roomId"];
  const validator: [boolean, string] = requestValidator(req, fields);
  if (!validator[0]) {
    return res.status(409).json({ message: `Missing ${validator[1]}` });
  }
  const body: any = req.body;
  const currUser: CurrentUser = authDetails(req);
  const room = await prisma.room.findFirst({
    where: { id: body.roomId },
    include: { members: true },
  });

  if (!room) {
    return res.status(409).json({ message: "rooom doesn't exist!" });
  }

  if (room.hostId == currUser.id) {
    return res.status(409).json({ message: "you're the host of the room!" });
  }

  if (room.members.length == 1000) {
    return res
      .status(409)
      .json({ message: "Room has reached maximum capacity!" });
  }

  if (room.members.some((member) => member.id == currUser.id)) {
    return res
      .status(409)
      .json({ message: "You've already joined this room!" });
  }

  prisma.room
    .update({
      where: { id: body.roomId },
      include: {
        members: {
          select: {
            id: true,
            userName: true,
            fullName: true,
          },
        },
      },
      data: {
        members: {
          connect: [{ id: currUser.id }],
        },
      },
    })
    .then((room: Room) => {
      io.emit(`room-update-${room.id}`);
      return res.status(200).json({ room: room });
    })
    .catch((err: Error) => {
      return errorResponse(res, err);
    });
};
const leaveRoom = async (req: Request, res: Response) => {
  const fields: string[] = ["roomId"];
  const validator: [boolean, string] = requestValidator(req, fields);
  if (!validator[0]) {
    return res.status(409).json({ message: `Missing ${validator[1]}` });
  }
  const body: any = req.body;
  const currUser: CurrentUser = authDetails(req);

  let room: Room | null = await prisma.room.findFirst({
    where: { id: body.roomId },
  });
  if (!room) {
    return res.status(409).json({ message: "Room doesn't exist!" });
  }

  prisma.room
    .update({
      where: {
        id: body.roomId,
      },
      data: {
        members: {
          disconnect: [{ id: currUser.id }],
        },
      },
    })
    .then((room: Room) => {
      io.emit(`room-update-${room.id}`);
      return res.status(200).json({ room: room, user: currUser });
    })
    .catch((err: Error) => {
      return errorResponse(res, err);
    });
};
const removeMember = async (req: Request, res: Response) => {
  const body: { roomId: number; memberId: number } = req.body;
  const currUser: CurrentUser = authDetails(req);
  let room: Room | null = await prisma.room.findFirst({
    where: { id: body.roomId, members: { some: { id: body.memberId } } },
  });
  if (!room) {
    return res.status(409).json({ message: "room not found!" });
  }
  if (room.hostId != currUser.id) {
    return res.status(409).json({ message: "you cannot remove any member!" });
  }
  prisma.room
    .update({
      where: {
        id: room.id,
      },
      data: {
        members: {
          disconnect: [{ id: body.memberId }],
        },
      },
    })
    .then((updatedRoom: Room) => {
      io.emit(`room-update-${updatedRoom.id}`);
      return res.status(200).json({ updatedRoom: updatedRoom });
    })
    .catch((err: Error) => {
      return errorResponse(res, err);
    });
};

export { getRooms, createRoom, joinRoom, leaveRoom, deleteRoom, removeMember };
