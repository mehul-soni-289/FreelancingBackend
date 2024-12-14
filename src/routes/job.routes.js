import express from "express";
import {
  getJobs,
  postJob,
  getPostedJobs,
  getJobById,
  search,
  getJobsPagination,
  postAplicant,
  viewApplicants,
  viewAppliedJobs,
  acceptJob,
  getCount
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const jobRouter = express.Router();

jobRouter.post("/postJob", verifyJWT, postJob);
jobRouter.get("/getJob", getJobs);
jobRouter.get("/getUserPostedJobs", verifyJWT, getPostedJobs);
jobRouter.get("/getJobByid/:id", getJobById);
jobRouter.get("/search/query", search);
jobRouter.get("/getJob/pagination", getJobsPagination);
jobRouter.post("/postApplication", verifyJWT, postAplicant);
jobRouter.get("/viewApplicants/:jobId", viewApplicants);
jobRouter.get("/getJob/viewAppliedJobs", verifyJWT, viewAppliedJobs);
jobRouter.post("/acceptJob",verifyJWT , acceptJob);
jobRouter.get("/getApplicationCount/:jobId" , getCount)

export { jobRouter };
