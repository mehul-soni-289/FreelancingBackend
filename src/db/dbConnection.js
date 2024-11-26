import mongoose from "mongoose";


async function connectDB() {
  try {
    const connectionInstant = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongo db connected successfull`);
    console.log(`${connectionInstant.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection error ", error);
    process.exit(1);
  }
}

export {connectDB};
