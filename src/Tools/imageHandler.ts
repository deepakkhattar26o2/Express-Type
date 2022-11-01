const multer = require("multer");
const multerInst = multer();
import path from 'path'
import {Request, Response} from "express";
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
  destination:  (req: any, file: any, cb: any)=> {
    cb(null, "./uploads/");
  },
  filename:  (req: any, file: any, cb: any) => {
    cb(
      null,
      req.query.attachment + ".jpg"
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

const ValidateDirectory = ()=>{
  if (!fs.existsSync(path.join(__dirname, "../../uploads"))) {
    fs.mkdirSync(path.join(__dirname, "../../uploads"));
    fs.writeFile(path.join(__dirname, "../../uploads", "default.jpg"), 'Hello content!',  (err) =>{
      if (err){
        console.log(err)
      }
    });
  }
}

const responseHandler =  (req: Request, res: Response) => {
  if (req.query.obj) {
    let obj = JSON.parse(String(req.query.obj))
    return res.status(200).json({ room : obj });
  } else {
    res.status(200).json({ message: "data not found!" });
  }}

export  {upload, imagePath, ValidateDirectory, responseHandler, multerInst};
