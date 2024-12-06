import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requiredSkills: {
    type: [],
  },
  minExperience: {
    type: Number,
  },
  minPay: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  mainDescritption: {
    type: String,
  },
  duration: {
    type: Number,
  },

}, {timestamps : true });

const Job = mongoose.model("Job" , jobSchema) ;



export {Job}