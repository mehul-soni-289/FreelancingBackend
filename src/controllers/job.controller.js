import { application, json } from "express";
import { Job } from "../models/jobs.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";

async function postJob(req, res) {
  const {
    jobTitle,
    description,
    requiredSkills,
    minExperience,
    minPay,
    duration,
    mainDescritption,
  } = req.body;

  const postedBy = req.user?._id;

  if (!jobTitle || !postedBy || !description) {
    return res.status(400).json({
      Error: "required fields not provided",
    });
  }

  const job = await Job.create({
    jobTitle,
    postedBy,
    description,
    requiredSkills,
    minExperience,
    minPay,
    duration,
    mainDescritption,
  });

  return res.status(201).json({
    Created: "Job created successfully",
    job: job,
  });
}

async function getJobs(req, res) {

  const { limit } = req.query;
  const { page } = req.query || 1;

  let jobs;

  if (limit) {
    const skip = (page - 1) * limit;
    jobs = await Job.find({status:"pending"})
      .select("-__v")
      .populate("postedBy", "fullname   -_id")
      .lean()
      .skip(skip)
      .limit(limit);
  } else {
    jobs = await Job.find({status:"pending"})
      .select("-__v")
      .populate("postedBy", "fullname   -_id")
      .lean();
  }

  const expand = jobs.map((job) => ({
    ...job,
    postedBy: job.postedBy.fullname,
  }));
  return res.status(200).json(expand);
}

async function getPostedJobs(req, res) {
  const userId = req.user?._id;
  let get = req.query?.get

  let findQuery = {
      postedBy : userId ,
    }

 if(get=="ongoing") {
    findQuery = {
      postedBy : userId , 
      status : "ongoing"
    }
  }
else if(get == "pending") {
      findQuery = {
        postedBy: userId,
        status: "pending",
      };
}


  const jobs = await Job.find(findQuery).select("-postedBy -__v");

  return res.status(200).json(jobs);
}

async function getJobById(req, res) {
  const jobId = req.params.id;
  const jobs = await Job.find({ _id: jobId })
    .select("-__v")
    .populate("postedBy", "fullname   -_id")
    .lean();
  const expand = jobs.map((job) => ({
    ...job,
    postedBy: job.postedBy.fullname,
  }));
  return res.status(200).json(expand);
}

async function search(req, res) {
  const { title } = req.query;
  let sort = req.query?.sort;

  const skills = { $regex: title, $options: "i" };
  const jobTitle = { $regex: title, $options: "i" };
  let data;

  if (!sort && title) {
    data = await Job.find({
      $or: [{ jobTitle: jobTitle }, { requiredSkills: skills }],
    })
      .populate("postedBy", "fullname   -_id")
      .lean();
  } else if (sort && !title) {
    sort = sort.replace(",", " ");
    data = await Job.find({})
      .sort(sort)
      .populate("postedBy", "fullname   -_id")
      .lean();
  } else if (sort && title) {
    sort = sort.replace(",", " ");
    data = await Job.find({
      $or: [{ jobTitle: jobTitle }, { requiredSkills: skills }],
    })
      .sort(sort)
      .populate("postedBy", "fullname   -_id")
      .lean();
  }

  const expand = data.map((job) => ({
    ...job,
    postedBy: job.postedBy.fullname,
  }));

  res.status(200).json(expand);
}

async function getJobsPagination(req, res) {
  const { limit } = req.query;
  const { page } = req.query || 1;

  let jobs;

  if (limit) {
    const skip = (page - 1) * limit;
    jobs = await Job.find({})
      .select("-__v")
      .populate("postedBy", "fullname   -_id")
      .lean()
      .skip(skip)
      .limit(limit);
  } else {
    jobs = await Job.find({})
      .select("-__v")
      .populate("postedBy", "fullname   -_id")
      .lean();
  }

  const expand = jobs.map((job) => ({
    ...job,
    postedBy: job.postedBy.fullname,
  }));
  return res.status(200).json(expand);
}

async function postAplicant(req, res) {
  const userId = req.user?._id;
  const jobId = req.body?.jobId;
  const proposal = req.body?.proposal;

  if (!userId || !jobId) {
    return res.status(400).json({
      Error: "required field not provided",
    });
  }

  const isExists = await Application.find({
    jobId: jobId,
    applicantId: userId,
  });

  if (isExists.length > 0) {
    return res.status(400).json({
      Applied: "You have already applied for this job",
    });
  }

  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(400).json({
      Error: "Error in finding job ",
    });
  }

  const clientId = job.postedBy;

  const application = await Application.create({
    applicantId: userId,
    clientId: clientId,
    proposal: proposal,
    jobId: jobId,
  });

  if (!application) {
    return res.status(400).json({
      Error: "Faliled to send application",
    });
  }

  return res.status(201).json({
    Success: "Your application sent successfully to client",
  });
}

async function viewApplicants(req, res) {
  const jobId = req.params?.jobId;
  if (!jobId) {
    return res.status(400).json({
      Error: "No job Id provided",
    });
  }

  const jobs = await Application.aggregate([
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "applicantId",
        foreignField: "_id",
        as: "applicant",
        pipeline: [
          {
            $project: {
              password: 0,
              __v: 0,
              refreshToken: 0,
            },
          },
        ],
      },
    },
  ]);

  const applicants = [];

  jobs.forEach((job) => {
    job.applicant[0]["applicationId"] = job._id;
    applicants.push(job.applicant[0]);
  });

  return res.status(200).json(applicants);
}

async function viewAppliedJobs(req, res) {
  const userId = req.user?._id;
  const get = req.query?.get

  if(!get || (get!="pending" && get!="completed" && get!="ongoing")){
    return res.status(400).json({
      Error : "Invalid request"
    })
  }

  if (!userId) {
    return res.status(400).json({
      Error: "Required fields not provided",
    });
  }

  const jobs = await Application.aggregate([
    {
      $match: {
        applicantId: new mongoose.Types.ObjectId(userId),
        status:get
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "jobs",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "postedBy",
              foreignField: "_id",
              as: "postedBy",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    _id: 0,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  if (jobs.length == 0 || !jobs) {
    return res.status(200).json([]);
  }

  const finalObject = [];

  jobs.forEach((job) => {
    job["jobs"][0]["postedBy"] = job["jobs"][0]["postedBy"][0]["fullname"];
    job["jobs"][0]["proposal"] = job.proposal;
    finalObject.push(job["jobs"][0]);
  });

  return res.status(200).json(finalObject);
}

async function acceptJob(req, res) {
  const userId = req.user?._id;
  const applicationId = req.body?.applicationId;

  const job = await Application.findById(applicationId);

  if (!job) {
    return res.status(400).json({
      error: "invalid application provided",
    });
  }

  if (!userId.equals(job.clientId)) {
    return res.status(401).json({
      Error: "credentials not valid",
    });
  }

  const jobId = job?.jobId;

  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      $set: {
        status: "ongoing",
      },
    },
    { new: true }
  );

  if (!updatedJob || updatedJob.length == 0) {
    return res.status(400).json({
      Error: "Error in finding job",
    });
  }

  job.status = "ongoing";
  await job.save();

  await Application.deleteMany({
    jobId: jobId,
    status: "pending",
  });

  return res.status(200).json({
    Ongoing: "The job is set to ongoing",
  });
}

async function getCount(req , res){

  const jobId = req.params.jobId 

  if(!jobId) {
    return res.status(400).json({
      Error : "Invalid request"
    })
  }

  const count = await Application.countDocuments({
    jobId : jobId ,
    status : 'pending'
  })
 
  return res.status(200).json({
    applicationCount : count
  })

}

export {
  postJob,
  getJobs,
  getPostedJobs,
  getJobById,
  search,
  getJobsPagination,
  postAplicant,
  viewApplicants,
  viewAppliedJobs,
  acceptJob,
  getCount
};
