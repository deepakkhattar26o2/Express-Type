import express, { Application } from "express";
import apiRouter from "./apiRouter";
const app : Application = express();
require('dotenv').config()
const cors = require('cors')

app.use(cors());
app.use(express.json());

app.use('/api',apiRouter)

const port  = Number(process.env.PORT) ||  5000;

app.listen(port, ()=>{
    console.log(`Server Listening at http://localhost:${port}`)
})
