import { Ongoing } from "../models/ongoing.model.js";
import { Application } from "../models/application.model.js";
import mongoose from "mongoose";

async function sendLink(req, res) {
  const body = req.body;
  const senderId = req.user?._id;

  if (!body.link) {
    return res.status(400).json({
      Error: "Link not provided",
    });
  }

  if (!body.applicationId) {
    return res.status(400).json({
      Error: "applicationId not provided",
    });
  }

  const application = await Application.findById(body.applicationId);
  const clientId = application?.clientId;

  console.log(clientId);

  if (!clientId) {
    return res.status(400).json({
      Error: "failed to fetch the details",
    });
  }

  const ongoing = await Ongoing.create({
    clientId: clientId,
    senderId: senderId,
    applicationId: body.applicationId,
    description: body.description,
    link: body.link,
  });

  if (!ongoing) {
    return res.status(400).json({
      Error: "failed to send the file link to the user",
    });
  }

  return res.status(200).json(ongoing);
}

async function acceptWork(req, res) {
  const linkId = req.body?.linkId;

  if (!linkId) {
    return res.status(400).json({
      Error: "provide the linkId",
    });
  }

  const accept = await Ongoing.findByIdAndUpdate(linkId, {
    status: "accepted",
  });

  if (!accept) {
    return res.status(400).json({
      Error: "error while accepting",
    });
  }

  return res.status(200).json({
    Success: "Work is accpeted",
  });
}

async function rejectWork(req, res) {
  const linkId = req.body?.linkId;
  const reason = req.body?.reason;

  if (!linkId) {
    return res.status(400).json({
      Error: "provide the linkId",
    });
  }
  if (!reason) {
    return res.status(400).json({
      Error: "provide the reason for rejecting",
    });
  }

  const reject = await Ongoing.findByIdAndUpdate(linkId, {
    status: "rejected",
    rejectReason: reason,
  });

  if (!reject) {
    return res.status(400).json({
      Error: "error while accepting",
    });
  }

  return res.status(200).json({
    Success: "Work is rejected",
  });
}

async function getPostedLinks(req, res) {
  const status = req.params.status;
  const a = ["pending", "accepted", "rejected"];
  const userId = req.user?._id;

  let pending = [];

  if (!a.includes(status)) {
    return res.status(400).json({
      Error: "provide the valid status",
    });
  }

  if (status == "pending") {
    pending = await aggregrateUploads("pending",userId);
  } else if (status == "accepted") {
    pending = await aggregrateUploads("accepted",userId);
  } else {
    pending = await aggregrateUploads("rejected",userId);
  }

  pending.map((upload) => {
    upload.jobName = upload.applicationDetails[0]["jobDetails"][0]["jobTitle"];
    upload.client =
      upload.applicationDetails[0]["jobDetails"][0]["postedBy"][0]["fullname"];
    upload.jobDescription =
      upload.applicationDetails[0]["jobDetails"][0]["description"];
    delete upload.applicationDetails;
  });

  return res.status(200).json(pending);
}

async function aggregrateUploads(status , senderId) {
  const pending = await Ongoing.aggregate([
    {
      $match: {
        status: status,
        senderId: new mongoose.Types.ObjectId(senderId),
      },
    },

    {
      $lookup: {
        from: "applications",
        foreignField: "_id",
        localField: "applicationId",
        as: "applicationDetails",

        pipeline: [
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "_id",
              as: "jobDetails",
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

                {
                  $project: {
                    jobTitle: 1,
                    description: 1,
                    postedBy: 1,
                    _id: 0,
                  },
                },
              ],
            },
          },
          {
            $project: {
              jobDetails: 1,
              _id: 0,
            },
          },
        ],
      },
    },
  ]);

  return pending;
}

async function aggregrateUploadsForClient(status , clientId) {
  const pending = await Ongoing.aggregate([
    {
      $match: {
        status: status,
        clientId: new mongoose.Types.ObjectId(clientId),
      },
    },

    {
      $lookup: {
        from: "applications",
        foreignField: "_id",
        localField: "applicationId",
        as: "applicationDetails",

        pipeline: [
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "_id",
              as: "jobDetails",
              pipeline: [
                {
                  $project: {
                    jobTitle: 1,
                    description: 1,
                    _id: 0,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "applicantId",
              foreignField: "_id",
              as: "workerDetails",
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
          {
            $project: {
              jobDetails: 1,
              workerDetails:1,
              _id: 0,
            },
          },
        ],
      },
    },
  ]);

  return pending;
}


async function getUploads(req ,res) {
  const status = req.params.status;
  const a = ["pending", "accepted", "rejected"];
  const userId = req.user?._id;

  let pending = [];

  if (!a.includes(status)) {
    return res.status(400).json({
      Error: "provide the valid status",
    });
  }

  if (status == "pending") {
    pending = await aggregrateUploadsForClient("pending" , userId);
    
  } else if (status == "accepted") {
    pending = await aggregrateUploadsForClient("accepted",userId);
   
  } else {
    pending = await aggregrateUploadsForClient("rejected",userId);
  }

  pending.map((upload) => {
    upload.jobName = upload.applicationDetails[0]["jobDetails"][0]["jobTitle"];
    upload.jobDescription = upload.applicationDetails[0]["jobDetails"][0]["description"];
    upload.uploadBy = upload.applicationDetails[0]["workerDetails"][0]["fullname"];

    delete upload.applicationDetails;
  });

  return res.status(200).json(pending);

  
}









export { sendLink, acceptWork, rejectWork, getPostedLinks , getUploads };
