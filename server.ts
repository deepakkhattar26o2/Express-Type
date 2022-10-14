import express, { Application, Request, Response } from "express";
import apiRouter from "./apiRouter";
import {upload, imagePath, multerInst} from "./src/Tools/imageHandler";
import path from "path";
import fs from "fs";
const app: Application = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

const port = Number(process.env.PORT) || 5000;

app.post("/image/:name", upload.single("image"), (req : Request, res : Response) => {
  res.status(200).json({ message: "worked" });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/image/:name", function (req : Request, res : Response) {
  res.sendFile(imagePath(req.params.name||"default"))
});

app.listen(port, () => {
  if (!fs.existsSync(path.join(__dirname, "uploads"))) {
    fs.mkdirSync(path.join(__dirname, "uploads"));
    fs.writeFile(path.join(__dirname, "uploads", "default.jpg"), 'Hello content!', function (err) {
      if (err){
        console.log(err)
      }
    });
  }
  console.log(`Server Listening at http://localhost:${port}`);
});