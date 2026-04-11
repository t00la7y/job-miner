import { Request, Response } from "express";
import Job from "../models/job";
import { fetchAllJobs } from "../services/jobService";
import {
  normalizeAdzuna,
  normalizeRemotive,
  normalizeJSearch,
} from "../utils/normalizeJob";

/**
 * Sanitize user input to prevent injection attacks
 */
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/[;&|`]/g, ""); // Remove shell characters
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    // Validate and sanitize inputs
    let { what = "developer", where = "south africa" } = req.query;
    
    what = sanitizeInput(String(what));
    where = sanitizeInput(String(where));

    // Basic validation
    if (what.length < 2 || where.length < 2) {
      return res.status(400).json({ 
        message: "Search terms must be at least 2 characters long" 
      });
    }

    console.log("getJobs hit with query:", { what, where });
    
    const { adzunaRaw, remotiveRaw, jsearchRaw } = await fetchAllJobs(what, where);
    
    const jobs = [
      ...normalizeAdzuna(adzunaRaw),
      ...normalizeRemotive(remotiveRaw),
      ...normalizeJSearch(jsearchRaw),
    ];

    // Deduplicate job listings
    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.url, job])).values(),
    );

    // Add security headers to response
    res.set("X-Content-Type-Options", "nosniff");
    res.json(uniqueJobs);
    
  } catch (error: any) {
    console.error("Controller error:", error.message, error.stack);
    res.status(500).json({ 
      message: "Failed to fetch jobs",
      // Don't expose internal error details in production
      ...(process.env.NODE_ENV === "development" && { error: error.message })
    });
  }
};

export const saveJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;

    // Validate job data
    if (!jobData.url || !jobData.title || !jobData.company) {
      return res.status(400).json({ 
        message: "Missing required job fields: url, title, company" 
      });
    }

    // Sanitize URL to prevent XSS
    const url = new URL(jobData.url);
    if (!url.protocol.match(/^https?:/)) {
      return res.status(400).json({ 
        message: "Invalid URL protocol" 
      });
    }

    // Check if job already saved
    const existingJob = await Job.findOne({ url: jobData.url });
    if (existingJob) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const savedJob = await Job.create(jobData);
    res.status(201).json(savedJob);
    
  } catch (error: any) {
    console.error("Save job error:", error.message);
    res.status(500).json({ 
      message: "Failed to save job",
      ...(process.env.NODE_ENV === "development" && { error: error.message })
    });
  }
};
