import prisma from "../../prismaClient";
import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
const bcr = require("bcrypt");
const jwt = require("jsonwebtoken");

interface signupRequest {
  email     : string;
  password  : string;
  name      : string;
}

const signupRequestValidator = (body: signupRequest): [boolean, string] => {
  if (!body.email || !body.email.endsWith("@gmail.com")) {
    return [false, "email"];
  }
  if (!body.password || body.password.length < 6) {
    return [false, "password"];
  }
  if (!body.name || body.name.length < 3) {
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
  const { email, password, name } = body;
  let alreadyExists: User | null = await prisma.user.findFirst({
    where: { email: email },
  });

  if (alreadyExists) {
    return res
      .status(409)
      .json({ message: "An account already exists with this email" });
  }
  bcr.hash(password, 10, (err: Error, hash: string) => {
    prisma.user
      .create({
        data: {
          email: email,
          password: hash,
          name: name,
          profile: {
            create: {
              bio: "Hello there!",
            },
          },
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
  email     : string;
  password  : string;
}

const loginRequestValidator = (body: loginRequest): [boolean, string] => {
  if (!body.email || !body.email.endsWith("@gmail.com")) {
    return [false, "email"];
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
  const { email, password } = body;
  
  let alreadyExists: User | null = await prisma.user.findFirst({
    where: { email: email },
  });

  if (!alreadyExists) {
    return res.status(409).json({ message: "Account doesn't exist!" });
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

interface CurrentUser{
  "id"          : number,
  "email"       : string,
  "name"        : string,
  "role"        : string,
  "createdAt"   : string,
  "iat"         : number
}
export { signupRequestHandler, loginRequestHandler, authDetails, verifyAuth , CurrentUser};
