import express from "express";
import { upload } from "../utils/cloudinary.js";
import { createAsset , getAssets, search , getAssetById } from "../controllers/asset.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const assetRouter = express.Router()

assetRouter.post('/uploadAsset' ,verifyJWT ,  upload.fields(

    [
        {
            name : "demoImages",
            maxCount : 2 
        } , 
        {
            name : "file"  , 
            maxCount : 1
        }
    ]

) , createAsset )

assetRouter.get('/getAssets' ,getAssets )
assetRouter.get('/search' , search)
assetRouter.get('/getAssetById/:id' ,getAssetById )

export {assetRouter}