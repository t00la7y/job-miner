"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJob = exports.getJobs = void 0;
const job_1 = __importDefault(require("../models/job"));
const jobService_1 = require("../services/jobService");
const cacheService_1 = require("../services/cacheService");
const normalizeJob_1 = require("../utils/normalizeJob");
const embeddingService_1 = require("../services/embeddingService");
const qdrantClient_1 = require("../services/qdrantClient");
/**
 * Sanitize user input to prevent injection attacks
 */
const sanitizeInput = (input) => {
    return input
        .trim()
        .slice(0, 100) // Limit length
        .replace(/[<>]/g, "") // Remove angle brackets
        .replace(/[;&|`]/g, ""); // Remove shell characters
};
const getJobs = async (req, res) => {
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
        const queryKey = (0, cacheService_1.buildQueryKey)(what, effectiveWhere);
        console.log("getJobs hit with query:", {
            what,
            where,
            effectiveWhere,
            queryKey,
        });
        const cachedJobs = await (0, cacheService_1.getCached)(queryKey);
        if (cachedJobs) {
            console.log(`Cache hit: ${queryKey} (${cachedJobs.length} jobs)`);
            res.set("X-Content-Type-Options", "nosniff");
            return res.json(cachedJobs);
        }
        console.log(`Cache miss: ${queryKey} — fetching from APIs`);
        const { adzunaRaw, remotiveRaw, jsearchRaw, arbeitNowRaw, greenhouseRaw, leverRaw, ashbyRaw, workableRaw, recruiteeRaw, personioRaw, } = await (0, jobService_1.fetchAllJobs)(what, effectiveWhere);
        const jobs = [
            ...(0, normalizeJob_1.normalizeAdzuna)(adzunaRaw),
            ...(0, normalizeJob_1.normalizeRemotive)(remotiveRaw),
            ...(0, normalizeJob_1.normalizeJSearch)(jsearchRaw),
            ...(0, normalizeJob_1.normalizeArbeitNow)(arbeitNowRaw),
            ...(0, normalizeJob_1.normalizeGreenhouse)(greenhouseRaw),
            ...(0, normalizeJob_1.normalizeLever)(leverRaw),
            ...(0, normalizeJob_1.normalizeAshby)(ashbyRaw),
            ...(0, normalizeJob_1.normalizeWorkable)(workableRaw),
            ...(0, normalizeJob_1.normalizeRecruitee)(recruiteeRaw),
            ...(0, normalizeJob_1.normalizePersonio)(personioRaw),
        ];
        const uniqueJobs = Array.from(new Map(jobs.map((job) => [job.url, job])).values());
        if (uniqueJobs.length > 0) {
            await (0, cacheService_1.setCached)(queryKey, uniqueJobs);
            res.set("X-Content-Type-Options", "nosniff");
            return res.json(uniqueJobs);
        }
        const staleJobs = await (0, cacheService_1.getCachedOrStale)(queryKey);
        if (staleJobs && staleJobs.length > 0) {
            console.warn(`All APIs failed for ${queryKey}; returning cached fallback data (${staleJobs.length} jobs)`);
            res.set("X-Content-Type-Options", "nosniff");
            return res.json(staleJobs);
        }
        res.set("X-Content-Type-Options", "nosniff");
        res.json(uniqueJobs);
    }
    catch (error) {
        console.error("Controller error:", error.message, error.stack);
        res.status(500).json({
            message: "Failed to fetch jobs",
            ...(process.env.NODE_ENV === "development" && { error: error.message }),
        });
    }
};
exports.getJobs = getJobs;
const saveJob = async (req, res) => {
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
        const existingJob = await job_1.default.findOne({ url: jobData.url });
        if (existingJob) {
            return res.status(400).json({ message: "Job already saved" });
        }
        const savedJob = await job_1.default.create(jobData);
        // Generate embedding and store in Qdrant (fire and forget)
        try {
            const embedding = await (0, embeddingService_1.generateJobEmbedding)({
                title: savedJob.title,
                description: savedJob.description,
                tags: [], // Add tags if available in the future
            });
            await (0, qdrantClient_1.upsertJobVector)(savedJob._id.toString(), embedding);
        }
        catch (embeddingError) {
            console.error("Error generating job embedding:", embeddingError);
            // Don't fail the save if embedding fails
        }
        res.status(201).json(savedJob);
    }
    catch (error) {
        console.error("Save job error:", error.message);
        res.status(500).json({
            message: "Failed to save job",
            ...(process.env.NODE_ENV === "development" && { error: error.message }),
        });
    }
};
exports.saveJob = saveJob;
//# sourceMappingURL=jobsController.js.map