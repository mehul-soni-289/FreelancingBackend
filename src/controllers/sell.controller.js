import { Sell } from "../models/sell.model.js";
import { Asset } from "../models/assets.model.js    ";
import mongoose from "mongoose";
async function buyAsset(req , res) {
  const buyer = req.user?._id;
  const assetId = req.body?.assetId;


  if (!buyer || !assetId) {
    return res.status(400).json({
      Error: "required field not provided",
    });
  }
  const isExists = await Sell.find({
buyer : buyer , 
asseId : assetId
  });

  if (isExists.length > 0) {
    return res.status(400).json({
      Applied: "You have already bought this asset",
    });
  }

  const asset = await Asset.findById(assetId);

  if (!asset) {
    return res.status(400).json({
      Error: "Error in finding asset ",
    });
  }

  const seller = asset.createdBy;

  const sell = await Sell.create({
    buyer: buyer,
    seller: seller,
    assetId: assetId,
  });

  if (!sell) {
    return res.status(400).json({
      Error: "Error while buying",
    });
  }

  return res.status(201).json({
    Success: "You have bought the asset",
  });
  
}

async function showBoughtAssets(req ,res) {

  const userId = req.user?._id;


  if (!userId) {
    return res.status(400).json({
      Error: "Required fields not provided",
    });
  }

  const assets = await Sell.aggregate([
    {
      $match: {
        buyer: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "assets",
        localField: "assetId",
        foreignField: "_id",
        as: "assets",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    _id: 0,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  if (assets.length == 0 || !assets) {
    
    return res.status(200).json([]);
  }

  const finalObject = [];

  assets.forEach((job) => {
    job["assets"][0]["createdBy"] = job["assets"][0]["createdBy"][0]["fullname"];
    job['assets'][0]['boughAt'] = job.createdAt
    const obj =  job['assets']
    finalObject.push(obj)
  });

  return res.status(200).json(finalObject);


    
    
}

async function  soldAssets(req , res) {
 
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({
      Error: "Required fields not provided",
    });
  }

  const assets = await Sell.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup : {
        from : "users" , 
        localField : "buyer",
        foreignField : "_id" , 
        as : "buyer"  , 
        pipeline : [
          {
            $project : {
              fullname : 1
            }
          }
        ]
      }  , 
    },
    {
      $lookup: {
        from: "assets",
        localField: "assetId",
        foreignField: "_id",
        as: "assets",
      },
    },
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  console.log(assets[0]["buyer"][0]["fullname"]);

  // return res.status(200).json(assets)

  if (assets.length == 0 || !assets) {
    return res.status(200).json([]);
  }

  const finalObject = [];

  assets.forEach((job) => {
    job["assets"][0]["buyer"] =
      job["buyer"][0]["fullname"];
    job["assets"][0]["boughAt"] = job.createdAt;
    const obj = job["assets"];
    console.log(obj);
    
    finalObject.push(obj);
  });

  return res.status(200).json(finalObject);


}

async function getBuyCount(req , res) {
  const id = req.params.id 
const  buyCount = await Sell.find({assetId : id}).countDocuments()
console.log(buyCount);

return res.status(200).json({
  buyCount : buyCount
})
  
}



export {buyAsset , showBoughtAssets , soldAssets ,getBuyCount}