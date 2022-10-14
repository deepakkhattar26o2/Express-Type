import { User } from "@prisma/client";
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

const updateProfile = async (req: Request, res: Response, next : NextFunction) => {
  const body = req.query;
  const currUser : CurrentUser = authDetails(req);
  let user : User | null = await prisma.user.findFirst({where : {id : currUser.id}})
  if(!user){
    return res.status(409).json({message : "invalid user token!"});
  }
  prisma.user.update({
    where : {id : user.id},
    data : {
      bio : String(body.bio) || user.bio
    }
  }).then(
    (updatedUser : User)=>{
      if(req.query.attachment){
        req.query.obj = JSON.stringify(updatedUser);
        req.query.attachment = "profile-"+updatedUser.id
        next()
      }
      else{
        return res.status(200).json({user : updatedUser})
      }
    }
  ).catch(
    (err : Error)=>{return res.status(500).json({message : err.message})}
  )
};

export { updatePassword , updateProfile};
