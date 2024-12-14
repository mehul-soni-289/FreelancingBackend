import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: String,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status : {
      type : String , 
      default : 'pending'
    }
  },
  { timestamps: true }
);

const Application = mongoose.model('Application' , applicationSchema) 

export {Application}
