import { v2 as cloudinary } from "cloudinary";

async function uploadImage (path) {
  // Configuration
  cloudinary.config({
    cloud_name: "dgunv9sod",
    api_key: "138361878371828",
    api_secret: "<your_api_secret>", // Click 'View API Keys' above to copy your API secret
  });

  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(
      path
    )
    .catch((error) => {
      console.log(error);
    });

return uploadResult.url ;
};
