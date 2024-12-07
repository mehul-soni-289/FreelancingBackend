import { json } from "express";
import { Job } from "../models/jobs.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

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
  const jobs = await Job.find({})
    .select("-__v")
    .populate("postedBy", "fullname   -_id")
    .lean();
  const expand = jobs.map((job) => ({
    ...job,
    postedBy: job.postedBy.fullname,
  }));
  return res.status(200).json(expand);
}

async function getPostedJobs(req, res) {
  const userId = req.user?._id;

  const jobs = await Job.find({
    postedBy: userId,
  }).select("-postedBy -__v");

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
  const { title} = req.query;
  let sort = req.query?.sort

  const skills = { $regex: title, $options: "i" };
  const jobTitle = { $regex: title, $options: "i" };
  let data;

  if (!sort && title) {
    data = await Job.find({
      $or: [{ jobTitle: jobTitle }, { requiredSkills: skills }],
    });
  } else if (sort && !title) {
    sort = sort.replace(","," ");
    data = await Job.find({}).sort(sort);
  } else if (sort && title) {
    sort = sort.replace(",", " ");
    data = await Job.find({
      $or: [{ jobTitle: jobTitle }, { requiredSkills: skills }],
    }).sort(sort);
  }

  res.status(200).json(data);
}

async function getJobsPagination(req, res) {

  const {limit} = req.query
  const {page} = req.query || 1

  let jobs ;

  if(limit){
    const skip = (page - 1)*limit
    jobs = await Job.find({})
      .select("-__v")
      .populate("postedBy", "fullname   -_id")
      .lean()
      .skip(skip)
      .limit(limit);
  }else{
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


export { postJob, getJobs, getPostedJobs, getJobById, search , getJobsPagination };
