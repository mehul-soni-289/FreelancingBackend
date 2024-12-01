import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { jobRouter } from "./routes/job.routes.js";
import { userRouter } from "./routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
  })
);
// middelwares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/jobs", jobRouter);
app.use("/user", userRouter);

export { app };
