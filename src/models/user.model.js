import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        requied: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    fullname: {
        type: String,
        required: true
    }
    ,
    skills : [] , 
    refreshToken: {
        type: String
    }




})



userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 10)
        next()

    }
    next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
    console.log(password);
    console.log(this.password);


    const isCorrect = await bcrypt.compare(password, this.password);
    console.log(isCorrect);
    return isCorrect
};


userSchema.methods.generateAccessToken =  function () {

    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )


}

userSchema.methods.generateRefreshToken =  function () {

    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );



};

const User = mongoose.model("User", userSchema);
export { User }


