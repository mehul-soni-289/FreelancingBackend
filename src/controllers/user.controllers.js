import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { uploadToCloudinary } from "../utils/cloudinary.js";

async function generateAccessTokenRefeshToken(userId) {

    const user = await User.findById(userId);

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false })
    return { refreshToken, accessToken };
}






async function registerUser(req, res) {
    const { username, email, password, fullname, skills } = req.body
    if (!username || !email || !password || !fullname) {
        return res.status(400).json({
            Error: "required fields not provided"
        })
    }

    const duplicate = await User.findOne({
        $or: [{ username }, { email }]
    }

    )

    if (duplicate) {
        return res.status(400).json({
            Error: "Duplicate user with email or username found"
        })
    }

    const user = await User.create({
        username,
        email,
        skills,
        password,
        fullname
    })

    return res.status(201).json({
        Success: "User registration successfull"
    })




}


async function loginUser(req, res) {

    const { username, email, password } = req.body

    if ((!username && !email) || !password) {
        return res.status(400).json({
            Error: "required fields not provided"
        })
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    })

    if (!user) {
        return res.status(401).json({
            Error: "Invalid username or email"
        })
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        return res.status(401).json({
            Error: "Wrong password entered"
        })
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefeshToken(user._id)


    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
    };


    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json({
            Success: "User logged in successfully",
            data: user
        })

}

async function logoutUser(req, res) {


    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined
        }
    },

        {
            new: true
        }

    )

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };


    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: "User logged Out sucessfully"
        })


}

async function loginCheck(req, res) {

    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")


        if (!token) {
            return res.status(401).json({
                isLoggedIn: false
            })
        }


        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id).select("-password -refreshToken")

        if (!user) {
            return res.status(401).json({
                isLoggedIn: false
            })
        }

        return res.status(200).json({
            isLoggedIn: true
        })



    } catch (error) {
        return res.status(401).json({
            Error: "invalid token from catch"
        })
    }





}

async function getUserDetails(req , res){

    const user_id = req.user?._id ;

    const user = await User.findById(user_id).select("-password -refreshToken -_id -__v")

        
    if(!user){
        return res.status(400).json({
            Error : "Some error has occured while fetching the data"
        })
    }



    return res.status(200).json(user)





}


 async function uploadProfilePic(req, res) {
   let imageUrl = ""
    try {
     // Access the file buffer
     const buffer = req.file.buffer;

     // Upload the buffer to Cloudinary
     const result = await uploadToCloudinary(buffer, "profilePictures");
     imageUrl = result.secure_url 

     // Send the response back with Cloudinary URL
   } catch (error) {
     console.error("Error uploading to Cloudinary:", error);
     res.status(500).json({ error: "Failed to upload image" });
   }

   const user_id = req.user?._id 
   const user = await User.findByIdAndUpdate(user_id , {
    $set : {
        profilePic : imageUrl
    }
   })

        res.status(200).json({
       message: "Image uploaded successfully!",
       URL : imageUrl
     });

 };

 async function getUser(req , res) {
    const username = req.params?.username 

    if(!username) {
        return res.status(400).json({
            Error : "Provide username"
        })
    }

    const user = await User.find({username : username}).select("-password -refreshToken")

    return res.status(200).json(user)
    
 }

export { registerUser, loginUser, logoutUser, loginCheck , uploadProfilePic , getUserDetails ,getUser }