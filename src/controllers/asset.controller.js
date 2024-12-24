import { Asset } from "../models/assets.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
async function createAsset(req, res) {
  const userId = req.user?._id;
  const { name, description, price } = req.body;
  if (!name || !price) {
   return res.status(400).json({
      Error: "Required Fields not provided",
    });
  }

  const demoImages = req.files?.demoImages;
  const file = req.files?.file;

  if (demoImages.length > 2) {
    return res.status(400).json({
      Error: "You can upload maximum 2 images",
    });
  }
  if (file.length == 0 || file.length > 1) {
    return res.status(400).json({
      Error: "you have to upload exactly one file",
    });
  }
  if (file[0].mimetype != "application/zip") {
    return res.status(400).json({
      Error: "File must be in zip format",
    });
  }

  const demoImagesUrl = [];

  demoImages.forEach(async (element) => {
    const buffer = element.buffer;
    const result = await uploadToCloudinary(buffer, "demoImages");
    console.log(result);
    demoImagesUrl.push(result.secure_url);
  });

  const result = await uploadToCloudinary(file[0].buffer, "assets", {
    resource_type: "raw",
  });

  console.log(result);

  const fileUrl = `${result.secure_url}?fl_attachment=${encodeURIComponent(
    result.original_filename
  )}`;

  // console.log(demoImages);
  console.log(file);

  const uploaded = await Asset.create({
    name: name,
    description: description,
    price: price,
    demoImages: demoImagesUrl,
    file: fileUrl,
    createdBy: userId,
  });

  return res.status(200).json(uploaded);
}

async function getAssets(req, res) {
  const { limit } = req.query;
  const { page } = req.query || 1;

  let assets;

  if (limit) {
    const skip = (page - 1) * limit;
    assets = await Asset.find({})
      .select("-__v")
      .populate("createdBy", "fullname")
      .lean()
      .skip(skip)
      .limit(limit);
  } else {
    assets = await Asset.find({})
      .select("-__v")
      .populate("createdBy", "fullname")
      .lean();
  }

  const expand = assets.map((asset) => ({
    ...asset,
    createdBy: asset.createdBy.fullname,
    
  }));
  return res.status(200).json(expand);
}

async function search(req, res) {
  const { title } = req.query;
  let sort = req.query?.sort;

  const description = { $regex: title, $options: "i" };
  const assetName = { $regex: title, $options: "i" };
  let data;

  if (!sort && title) {
    data = await Asset.find({
      $or: [{ name: assetName }, { description: description }],
    })
      .populate("createdBy", "fullname   -_id")
      .lean();
  } else if (sort && !title) {
    sort = sort.replace(",", " ");
    data = await Asset.find({})
      .sort(sort)
      .populate("createdBy", "fullname   -_id")
      .lean();
  } else if (sort && title) {
    sort = sort.replace(",", " ");
    data = await Asset.find({
      $or: [{ name: assetName }, { description: description }],
    })
      .sort(sort)
      .populate("createdBy", "fullname   -_id")
      .lean();
  }

  const expand = data.map((job) => ({
    ...job,
    postedBy: job.createdBy.fullname,
  }));

  res.status(200).json(expand);
}

async function getAssetById(req , res) {

  const id = req.params.id 

  const asset = await Asset.findById(id)

  return res.status(200).json(asset)
  
}

export { createAsset ,getAssets , search , getAssetById};
