import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { buyAsset , showBoughtAssets , soldAssets , getBuyCount} from "../controllers/sell.controller.js";
const sellRouter = express.Router()


sellRouter.post("/buyAsset" , verifyJWT ,buyAsset )
sellRouter.get("/viewBoughtAssets" , verifyJWT ,showBoughtAssets )
sellRouter.get('/viewSoldAssets' , verifyJWT ,soldAssets)
sellRouter.get('/getBuyCount/:id' , getBuyCount)


export {sellRouter}