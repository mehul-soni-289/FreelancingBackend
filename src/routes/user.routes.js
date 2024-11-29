import { registerUser, loginUser, logoutUser, loginCheck } from "../controllers/user.controllers.js";
import { verifyLogin, verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express"


const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/checklogin", loginCheck)
userRouter.get("/logout", logoutUser)

export { userRouter }
