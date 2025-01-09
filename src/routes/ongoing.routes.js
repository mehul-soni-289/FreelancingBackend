import express from "express";

import { rejectWork, acceptWork , sendLink ,getPostedLinks , getUploads} from "../controllers/ongoing.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";



const ongoingRouter = express.Router()


ongoingRouter.post('/sendlink' ,verifyJWT ,  sendLink)
ongoingRouter.post('/acceptwork'  ,acceptWork )
ongoingRouter.post('/rejectwork'  ,rejectWork )
ongoingRouter.get('/getpostedlinks/:status' , verifyJWT , getPostedLinks)
ongoingRouter.get('/getlinksclient/:status' , verifyJWT , getUploads)


export {ongoingRouter}


