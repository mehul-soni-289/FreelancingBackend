import mongoose from "mongoose";

const assetsSchema = new mongoose.Schema({

name : {
    type : String , 
    required : true 
} , 

createdBy : {
    type : mongoose.Schema.Types.ObjectId , 
    ref  : "User" , 
    required : true 
} ,

description : {
    type : String , 
    required : true 
} , 

demoImages : {
    type : [String] , 
} , 

price : {
    type : Number , 
    required : true 
} , 

file : {
    type : String , 
    required : true 
}



} , {timestamps : true })

const Asset = mongoose.model('Asset' , assetsSchema)

export {Asset}