import { v2 as cloudinary } from "cloudinary";
import {Readable} from "stream"
import multer from "multer";



// Configure Cloudinary
cloudinary.config({
  cloud_name: "dgunv9sod",
  api_key: "138361878371828",
  api_secret: "iOqRPa8DDsCHaV94YuZD7W4GgPc",
});

// Set up Multer with memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });

export {upload}

// Helper function to convert buffer to stream
function bufferToStream(buffer) {
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);
  return readableStream;
}

// Function to upload buffer to Cloudinary
async function uploadToCloudinary(buffer, folder) {
  const stream = bufferToStream(buffer);

  return new Promise((resolve, reject) => {
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Pipe the buffer stream to Cloudinary
    stream.pipe(cloudinaryStream);
  });
}


export {uploadToCloudinary}
