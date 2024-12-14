import {
  registerUser,
  loginUser,
  logoutUser,
  loginCheck,
  uploadProfilePic,
  getUserDetails , 
} from "../controllers/user.controllers.js";
import { verifyLogin, verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";
import { upload } from "../utils/cloudinary.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/checklogin", loginCheck);
userRouter.get("/logout", logoutUser);
userRouter.get("/nothing", (req, res) => {
  res.send("ok");
});
userRouter.get("/userdata",verifyJWT , getUserDetails)
userRouter.post("/profilePic", upload.single("image"), verifyJWT , uploadProfilePic);
export { userRouter };
