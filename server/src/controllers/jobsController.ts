import { Request, Response } from "express";
import Job from "../models/job";
import { fetchAllJobs } from "../services/jobService";
import {
  normalizeAdzuna,
  normalizeRemotive,
  normalizeJSearch,
} from "../utils/normalizeJob";

export const getJobs = async (req: Request, res: Response) => {
  try {
    console.log("getJobs hit", req.query); // 👈
    const { what = "developer", where = "south africa" } = req.query;
    const { adzunaRaw, remotiveRaw, jsearchRaw } = await fetchAllJobs(
      what as string,
      where as string,
    );
    const jobs = [
      ...normalizeAdzuna(adzunaRaw),
      ...normalizeRemotive(remotiveRaw),
      ...normalizeJSearch(jsearchRaw),
    ];
    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.url, job])).values(),
    );
    res.json(uniqueJobs);
  } catch (error: any) {
    console.error("Controller error:", error.message, error.stack); // 👈
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const saveJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;

    const existingJob = await Job.findOne({ url: jobData.url });
    if (existingJob) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const savedJob = await Job.create(jobData);
    res.status(201).json(savedJob);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to save job" });
  }
};
