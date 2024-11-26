import { json } from "express";
import { Job } from "../models/jobs.model.js";


async function postJob(req, res) {

    const { jobPost, postedBy, description, skills, experience, payRange } = req.body


    if (!jobPost || !postedBy || !description) {

        return res.status(400).json({
            Error: "required fields not provided"
        })
    }


    const job = await Job.create({
        jobPost,
        postedBy,
        description,
        skills,
        experience,
        payRange,
    })

    return res.status(201).json({
        Created: "Job created successfully",
        ...job
    })




}


async function getJobs(req, res) {

    const jobs = await Job.find({}).select("-__v")

    return res.status(200).json(jobs)
}


export { postJob, getJobs }