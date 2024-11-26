import express from "express"
import { getJobs, postJob } from "../controllers/job.controller.js"


const jobRouter = express.Router()

jobRouter.post("/postJob", postJob)
jobRouter.get("/getJob", getJobs)


export { jobRouter }