import mongoose, { Types } from "mongoose";


const ongoingSchema = new mongoose.Schema({

clientId :{
    type : mongoose.Schema.Types.ObjectId  , 
    ref : 'User',
    required : true 
}
,

senderId :{
   type :mongoose.Schema.Types.ObjectId  , 
   ref : 'User',
   required : true 
}  , 

link: {
    type : String , 
    required : true 
} , 

applicationId : {
    type : mongoose.Schema.Types.ObjectId , 
    ref : 'Application' , 
    required : true
} , 

status : {
    type : String , 
    default : 'pending' , 
}
, 

description : {
    type : String , 
},

rejectReason : {
   type : String 
}




} , {
    timestamps : true 
})

const Ongoing = mongoose.model('Ongooing' , ongoingSchema)


export {Ongoing}