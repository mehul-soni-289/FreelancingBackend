import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({

    jobPost : {
        type : String ,
        required : true
    } , 
    postedBy : {
        type : String ,
        required : true 
    } , 
    skills : {
        type : [] , 
    } , 
    experience : {
        type : String
    } , 
    payRange : {
        type : String
    } , 
    description  : {
        type : String , 
        required : true 
    } 
    


})

const Job = mongoose.model("Job" , jobSchema) ;



export {Job}