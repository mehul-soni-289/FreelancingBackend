import mongoose from "mongoose";

const sellSchema = new mongoose.Schema({

    seller : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User"
    } , 
    buyer : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User"
    } , 

    assetId : {

        type  : mongoose.Schema.Types.ObjectId , 
        ref : "Asset"

    }





} , {timestamps: true})

const Sell = mongoose.model('Sell' , sellSchema)

export {Sell}