"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePersonio = exports.normalizeRecruitee = exports.normalizeWorkable = exports.normalizeAshby = exports.normalizeLever = exports.normalizeGreenhouse = exports.normalizeArbeitNow = exports.normalizeJSearch = exports.normalizeRemotive = exports.normalizeAdzuna = void 0;
const normalizeAdzuna = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company?.display_name || "Unknown",
    location: job.location?.display_name || "Worldwide",
    description: job.description || "",
    url: job.redirect_url,
    salary: job.salary_min ? `R${job.salary_min}` : "N/A",
    source: "Adzuna",
    image: null, // ← Add this (Adzuna rarely gives logos)
}));
exports.normalizeAdzuna = normalizeAdzuna;
const normalizeRemotive = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company_name || "Unknown",
    location: job.candidate_required_location || "Remote",
    description: job.description || "",
    url: job.url,
    salary: job.salary || "N/A",
    source: "Remotive",
    image: job.company_logo || null, // ← Good
}));
exports.normalizeRemotive = normalizeRemotive;
const normalizeJSearch = (jobs) => jobs.map((job) => ({
    title: job.job_title,
    company: job.employer_name || "Unknown",
    location: job.job_city || job.job_country || "Worldwide",
    description: job.job_description || "",
    url: job.job_apply_link,
    salary: job.job_salary || "N/A",
    source: "JSearch",
    image: job.employer_logo || null,
}));
exports.normalizeJSearch = normalizeJSearch;
const normalizeArbeitNow = (jobs) => jobs.map((job) => ({
    title: job.title || job.position || job.job_title || "Unknown",
    company: job.company || job.company_name || job.name || "Unknown",
    location: job.location || job.city || job.remote || "Worldwide",
    description: job.description || job.content || job.excerpt || "",
    url: job.url || job.job_link || job.slug || "",
    salary: job.salary || job.compensation || "N/A",
    source: "ArbeitNow",
    image: null,
}));
exports.normalizeArbeitNow = normalizeArbeitNow;
const normalizeGreenhouse = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company_name || "Unknown",
    location: job.location?.name || "Worldwide",
    description: job.content || job.education || "",
    url: job.absolute_url,
    salary: "N/A",
    source: "Greenhouse",
    image: null,
}));
exports.normalizeGreenhouse = normalizeGreenhouse;
const normalizeLever = (jobs) => jobs.map((job) => ({
    title: job.text || job.title || "Unknown",
    company: job.hostedUrl ? new URL(job.hostedUrl).hostname : "Unknown",
    location: job.categories?.location || job.categories?.commitment || "Worldwide",
    description: job.description || job.notes || "",
    url: job.applyUrl || job.hostedUrl || "",
    salary: job.salaryRange?.currency && job.salaryRange?.min
        ? `${job.salaryRange.currency} ${job.salaryRange.min}-${job.salaryRange.max}`
        : "N/A",
    source: "Lever",
    image: null,
}));
exports.normalizeLever = normalizeLever;
const normalizeAshby = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company || "Unknown",
    location: job.location || "Worldwide",
    description: job.description || "",
    url: job.jobUrl || job.applyUrl || "",
    salary: job.compensation?.compensationTierSummary || "N/A",
    source: "Ashby",
    image: null,
}));
exports.normalizeAshby = normalizeAshby;
const normalizeWorkable = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company || "Unknown",
    location: job.location || job.department || "Worldwide",
    description: job.description || job.summary || "",
    url: job.url || "",
    salary: job.salary || "N/A",
    source: "Workable",
    image: null,
}));
exports.normalizeWorkable = normalizeWorkable;
const normalizeRecruitee = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.companyName || job.company_name || "Unknown",
    location: job.location || "Worldwide",
    description: job.description || "",
    url: job.careers_apply_url || job.careers_url || "",
    salary: job.salary || "N/A",
    source: "Recruitee",
    image: null,
}));
exports.normalizeRecruitee = normalizeRecruitee;
const normalizePersonio = (jobs) => jobs.map((job) => ({
    title: job.title,
    company: job.company || "Personio",
    location: job.location || "Worldwide",
    description: job.description || "",
    url: job.url || "",
    salary: "N/A",
    source: "Personio",
    image: null,
}));
exports.normalizePersonio = normalizePersonio;
//# sourceMappingURL=normalizeJob.js.map