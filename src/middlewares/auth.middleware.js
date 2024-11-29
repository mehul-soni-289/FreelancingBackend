import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
const verifyJWT = async function (req, res, next) {
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")


        

        if (!token) {
            return res.status(401).json({
                Error: "Unauthorized request"
            })
        }


        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id).select("-password -refreshToken")

        if (!user) {
            return res.status(401).json({
                Error: "Invalid token provided"
            })
        }


        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            Error: "invalid token from catch"
        })
    }




}


async function verifyLogin(req, res) {
    try {


        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")




        if (!token) {
            const isLogIn = {
                isLoggedIn: false
            }

            req.logIn = isLogIn
            next()

        }


        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id).select("-password -refreshToken")

        if (!user) {
            const isLogIn = {
                isLoggedIn: false
            }

            req.logIn = isLogIn
            next()

        }
        const isLogIn = {
            isLoggedIn: true
        }

        req.logIn = isLogIn
        next()



    } catch (error) {
        return res.status(401).json({
            Error: "invalid token from catch"
        })
    }




}

export { verifyLogin, verifyJWT }