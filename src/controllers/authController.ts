import prisma from "../../prismaClient";
import { NextFunction, Request, Response } from "express";
import { sendMail } from "../Tools/nodemailer";
import { User } from "@prisma/client";
const bcr = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomString = require('randomstring')

const confirmEmail = (req: Request, res: Response) => {
  if (!req.body.email) {
      
    return res.status(403).json({ message: "No Email Found!" });
  }
  const email = req.body.email;

  const otp: string = randomString.generate(6);

  sendMail(
    email,
    "testing smtp",
    `Your one time password is ${otp}`
  ).then((doc: any) => {
      res.status(200).json({ otp: otp, email: email, message: doc.info });
  }).catch((err: Error) => {
      res.status(500).json({ message: err.message });
  });
};

interface signupRequest {
  email     : string;
  password  : string;
  userName  : string;
}

const signupRequestValidator = (body: signupRequest): [boolean, string] => {
  if (!body.email || !body.email.endsWith("@gmail.com")) {
    return [false, "email"];
  }
  if (!body.password || body.password.length < 6) {
    return [false, "password"];
  }
  if (!body.userName || body.userName.length < 3) {
    return [false, "name"];
  }
  return [true, "success"];
};

const signupRequestHandler = async (req: Request, res: Response) => {
  const body: signupRequest = req.body;
  const validator = signupRequestValidator(body);
  if (!validator[0]) {
    return res.status(409).json({ message: `Invalid ${validator[1]}` });
  }
  const { email, password, userName } = body;
  let alreadyExists: User | null = await prisma.user.findFirst({
    where: { email: email },
  });

  if (alreadyExists) {
    return res
      .status(409)
      .json({ message: "An account already exists with this email" });
  }
  alreadyExists = await prisma.user.findFirst({
    where: { userName: userName },
  });
  if (alreadyExists) {
    return res
      .status(409)
      .json({ message: "An account already exists with this username" });
  }
  bcr.hash(password, 10, (err: Error, hash: string) => {
    prisma.user
      .create({
        data: {
          email: email,
          password: hash,
          userName: userName,
          bio : "Hello There!",
        },
      })
      .then((doc) => {
        const mdoc: any = Object.assign({}, doc);
        delete mdoc.password;
        const token = jwt.sign(mdoc, process.env.SECRET_KEY);
        return res.status(200).json({ user: mdoc, token: token });
      })
      .catch((err: Error) => {
        return res.status(500).json({ message: err.message });
      });
  });
};

interface loginRequest {
  email       : string;
  password    : string;
  userName    : string;
}

const loginRequestValidator = (body: loginRequest): [boolean, string] => {
  if (!body.email && !body.userName) {
    return [false, "ID"];
  }
  if (!body.password || body.password.length < 6) {
    return [false, "password"];
  }
  return [true, "success"];
};

const loginRequestHandler = async (req: Request, res: Response) => {
  const body: loginRequest = req.body;
  let validator = loginRequestValidator(body);
  if (!validator[0]) {
    return res.status(409).json({ message: `Invalid ${validator[1]}` });
  }
  const { email, password, userName } = body;
  var alreadyExists : User | null= await prisma.user.findFirst({
      where: { OR : [{userName: userName}, { email: email } ] },
    });

  if(!alreadyExists){
    return res.status(409).json({message : "Invalid Credentials!"})
  }

  bcr.compare(password, alreadyExists.password, (err: Error, same: boolean) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!same) {
      return res.status(409).json({ message: "Password doesn't match!" });
    }
    if (same) {
      const mdoc: any = Object.assign({}, alreadyExists);
      delete mdoc.password;
      const token = jwt.sign(mdoc, process.env.SECRET_KEY);
      return res.status(200).json({ user: mdoc, token: token });
    }
  });
};


interface CurrentUser{
  "id"          : number,
  "userName"    : string,
  "bio"         : string,
  "email"       : string,
  "role"        : string,
  "createdAt"   : string,
  "iat"         : number,
}

const authDetails = (req: Request): CurrentUser => {
  const token = req.headers.authorization;
  const decoded: CurrentUser = jwt.verify(token, process.env.SECRET_KEY);
  return decoded;
};

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (err) {
    return res.status(409).json({ Message: "Auth Failed!" });
  }
};


const authTest = (req : Request, res : Response)=>{
  const currUser : CurrentUser = authDetails(req);
  return res.status(200).json(currUser)
}
export { signupRequestHandler, loginRequestHandler, authDetails, verifyAuth ,confirmEmail, CurrentUser, authTest};
