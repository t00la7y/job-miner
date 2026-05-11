import { Request, Response } from "express";
import Job, { IJob } from "../models/job";
import { fetchAllJobs } from "../services/jobService";
import {
  getCached,
  getCachedOrStale,
  setCached,
  buildQueryKey,
} from "../services/cacheService";
import {
  normalizeAdzuna,
  normalizeRemotive,
  normalizeJSearch,
  normalizeArbeitNow,
  normalizeGreenhouse,
  normalizeLever,
  normalizeAshby,
  normalizeWorkable,
  normalizeRecruitee,
  normalizePersonio,
} from "../utils/normalizeJob";
import { generateJobEmbedding } from "../services/embeddingService";
import { upsertJobVector } from "../services/qdrantClient";

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
    let { what, where = "" } = req.query;

    what = sanitizeInput(String(what));
    where = sanitizeInput(String(where || "")).trim();

    // Basic validation
    if (what.length < 2 || (where.length > 0 && where.length < 2)) {
      return res.status(400).json({
        message: "Search terms must be at least 2 characters long",
      });
    }

    const effectiveWhere = where || "South Africa";
    const queryKey = buildQueryKey(what, effectiveWhere);
    console.log("getJobs hit with query:", {
      what,
      where,
      effectiveWhere,
      queryKey,
    });

    const cachedJobs = await getCached(queryKey);
    if (cachedJobs) {
      console.log(`Cache hit: ${queryKey} (${cachedJobs.length} jobs)`);
      res.set("X-Content-Type-Options", "nosniff");
      return res.json(cachedJobs);
    }

    console.log(`Cache miss: ${queryKey} — fetching from APIs`);
    const {
      adzunaRaw,
      remotiveRaw,
      jsearchRaw,
      arbeitNowRaw,
      greenhouseRaw,
      leverRaw,
      ashbyRaw,
      workableRaw,
      recruiteeRaw,
      personioRaw,
    } = await fetchAllJobs(what, effectiveWhere);

    const jobs = [
      ...normalizeAdzuna(adzunaRaw),
      ...normalizeRemotive(remotiveRaw),
      ...normalizeJSearch(jsearchRaw),
      ...normalizeArbeitNow(arbeitNowRaw),
      ...normalizeGreenhouse(greenhouseRaw),
      ...normalizeLever(leverRaw),
      ...normalizeAshby(ashbyRaw),
      ...normalizeWorkable(workableRaw),
      ...normalizeRecruitee(recruiteeRaw),
      ...normalizePersonio(personioRaw),
    ];

    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.url, job])).values(),
    );

    if (uniqueJobs.length > 0) {
      await setCached(queryKey, uniqueJobs as IJob[]);
      res.set("X-Content-Type-Options", "nosniff");
      return res.json(uniqueJobs);
    }

    const staleJobs = await getCachedOrStale(queryKey);
    if (staleJobs && staleJobs.length > 0) {
      console.warn(
        `All APIs failed for ${queryKey}; returning cached fallback data (${staleJobs.length} jobs)`,
      );
      res.set("X-Content-Type-Options", "nosniff");
      return res.json(staleJobs);
    }

    res.set("X-Content-Type-Options", "nosniff");
    res.json(uniqueJobs);
  } catch (error: any) {
    console.error("Controller error:", error.message, error.stack);
    res.status(500).json({
      message: "Failed to fetch jobs",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

export const saveJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;

    // Validate job data
    if (!jobData.url || !jobData.title || !jobData.company) {
      return res.status(400).json({
        message: "Missing required job fields: url, title, company",
      });
    }

    // Sanitize URL to prevent XSS
    const url = new URL(jobData.url);
    if (!url.protocol.match(/^https?:/)) {
      return res.status(400).json({
        message: "Invalid URL protocol",
      });
    }

    // Check if job already saved
    const existingJob = await Job.findOne({ url: jobData.url });
    if (existingJob) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const savedJob = await Job.create(jobData);

    // Generate embedding and store in Qdrant (fire and forget)
    try {
      const embedding = await generateJobEmbedding({
        title: savedJob.title,
        description: savedJob.description,
        tags: [], // Add tags if available in the future
      });
      await upsertJobVector(savedJob._id.toString(), embedding);
    } catch (embeddingError) {
      console.error("Error generating job embedding:", embeddingError);
      // Don't fail the save if embedding fails
    }

    res.status(201).json(savedJob);
  } catch (error: any) {
    console.error("Save job error:", error.message);
    res.status(500).json({
      message: "Failed to save job",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};
