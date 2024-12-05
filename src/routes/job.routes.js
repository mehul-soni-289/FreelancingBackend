import express from "express"
import { getJobs, postJob ,getPostedJobs , getJobById} from "../controllers/job.controller.js" 
import { verifyJWT } from "../middlewares/auth.middleware.js"


const jobRouter = express.Router()

jobRouter.post("/postJob",verifyJWT , postJob)
jobRouter.get("/getJob", getJobs)
jobRouter.get("/getUserPostedJobs" ,verifyJWT ,getPostedJobs )
jobRouter.get("/:id"  ,getJobById )



export { jobRouter }