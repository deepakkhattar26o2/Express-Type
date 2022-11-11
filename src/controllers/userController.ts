import { Post, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../prismaClient";
import { authDetails, CurrentUser } from "./authController";
const bcr = require("bcrypt");

interface updatePasswordRequestBody {
  password: string;
}
const updatePassword = (req: Request, res: Response) => {
  const body: updatePasswordRequestBody = req.body;
  const User: CurrentUser = authDetails(req);
  bcr.hash(body.password, 10, (err: Error, hash: string) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    prisma.user
      .update({
        where: {
          id: User.id,
        },
        data: {
          password: hash,
        },
      })
      .then((doc) => {
        return res.status(200).json(User);
      })
      .catch((err: Error) => {
        return res.status(200).json({ message: err.message });
      });
  });
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.query;
  const currUser: CurrentUser = authDetails(req);
  let user: User | null = await prisma.user.findFirst({
    where: { id: currUser.id },
  });
  if (!user) {
    return res.status(409).json({ message: "invalid user token!" });
  }
  prisma.user
    .update({
      where: { id: user.id },
      data: {
        bio: String(body.bio) == "undefined" ? user.bio : String(body.bio),
      },
      include: {
        followers: true,
        following: true,
      },
    })
    .then((updatedUser: User) => {
      if (req.query.attachment) {
        req.query.obj = JSON.stringify(updatedUser);
        req.query.attachment = "profile-" + updatedUser.id;
        next();
      } else {
        return res.status(200).json({ user: updatedUser });
      }
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const followUser = async (req: Request, res: Response) => {
  if (!req.query.userId) {
    return res.status(409).json({ message: "Missing user id" });
  }
  const currUser: CurrentUser = authDetails(req);
  let user: User | null = await prisma.user.findFirst({
    where: { id: Number(req.query.userId) },
  });
  if (!user) {
    return res.status(409).json({ message: "user doesn't exist" });
  }
  prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        followers: {
          connect: [{ id: currUser.id }],
        },
      },
      include: {
        followers: true,
        following: true,
      },
    })
    .then((updatedUser: User) => {
      return res.status(200).json({ user: updatedUser });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const removeFollower = async (req: Request, res: Response) => {
  if (!req.query.userId) {
    return res.status(409).json({ message: "Missing user id" });
  }
  if (!req.query.unfollow) {
    return res.status(409).json({ message: "req not specified!" });
  }
  let user: User | null = await prisma.user.findFirst({
    where: { id: Number(req.query.userId) },
  });
  if (!user) {
    return res.status(409).json({ message: "user doesn't exist" });
  }
  const currUser: CurrentUser = authDetails(req);
  let unfollow: boolean = Boolean(req.query.unfollow);
  prisma.user
    .update({
      where: {
        id: unfollow ? currUser.id : user.id,
      },
      data: {
        following: {
          disconnect: [{ id: unfollow ? user.id : currUser.id }],
        },
      },
      include: {
        followers: true,
        following: true,
      },
    })
    .then((updatedUser: User) => {
      return res.status(200).json({ user: updatedUser });
    })
    .catch((err: Error) => {
      return res.status(200).json({ message: err.message });
    });
};

const getActivities = async (req: Request, res: Response) => {
  const currUser: CurrentUser = authDetails(req);
  prisma.post
    .findMany({
      where: {
        user: {
          followers: {
            some: {
              id: currUser.id,
            },
          },
        },
      },
    })
    .then((posts: Post[]) => {
      return res.status(200).json({ posts: posts });
    })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const getUser = async (req: Request, res: Response) => {
  if (req.query.all) {
    let users: any = await prisma.user.findMany({
      select :{
        id : true,
        userName : true,
        fullName : true,
        email    : true
      }
    });
    return res.status(200).json({ users: users });
  }
  if (!req.query.userId && !req.query.search) {
    return res.status(409).json({ message: "missing search key" });
  }
  if (req.query.userId) {
    let user: any = await prisma.user.findFirst({
      where: { id: Number(req.query.userId) },
      include : {
        rooms     : true,
        followers : true,
        following : true,
        posts     : true
      }
    });
    delete user?.password
    return res.status(200).json({ user: user });
  }
  let users: any = await prisma.user.findMany({
    where: {
      OR: [
        { userName: { contains: String(req.query.search) } },
        { fullName: { contains: String(req.query.search) } },
      ],
    },
    select :{
      id : true,
      userName : true,
      fullName : true,
      email    : true
    }
  });
  return res.status(200).json({ users: users });
};
export {
  updatePassword,
  updateProfile,
  removeFollower,
  followUser,
  getActivities,
  getUser,
};
