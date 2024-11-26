import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { jobRouter } from "./routes/job.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
  })
);
// middelwares

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/jobs" , jobRouter)


export { app };
