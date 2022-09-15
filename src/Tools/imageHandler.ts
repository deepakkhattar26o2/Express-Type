const multer = require("multer");
import path from 'path'
import { NextFunction, Request, Response } from "express";
import fs from 'fs'
const fileFilter = (req: Request, file: any, cb: any) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, "./uploads/");
  },
  filename: function (req: any, file: any, cb: any) {
    cb(
      null,
      req.params.name + ".jpg"
      // file.originalname.slice(file.originalname.lastIndexOf("."))
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});


const imagePath = (name : string) : string =>{
  const file_path = path.join(__dirname, "../../uploads", name);
  const default_img_path = path.join(__dirname, "../../uploads", "default.jpg");
  try {
    if (fs.existsSync(file_path + ".jpg")) {
      return file_path + ".jpg"
    }
  } catch (err) {
   console.log(err) 
  }
  return default_img_path;
}

export  {upload, imagePath};
