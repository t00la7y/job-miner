"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCached = getCached;
exports.getCachedOrStale = getCachedOrStale;
exports.setCached = setCached;
exports.buildQueryKey = buildQueryKey;
const JobCache_1 = __importDefault(require("../models/JobCache"));
const TTL_HOURS = Number(process.env.CACHE_TTL_HOURS) || 6;
function isStale(fetchedAt, ttlHours) {
    const ageMs = Date.now() - fetchedAt.getTime();
    return ageMs > ttlHours * 60 * 60 * 1000;
}
async function getCached(queryKey) {
    const entry = await JobCache_1.default.findOne({ queryKey }).lean();
    if (!entry)
        return null;
    if (isStale(entry.fetchedAt, entry.ttlHours))
        return null;
    return entry.jobs;
}
async function getCachedOrStale(queryKey) {
    const entry = await JobCache_1.default.findOne({ queryKey }).lean();
    if (!entry)
        return null;
    return entry.jobs;
}
async function setCached(queryKey, jobs) {
    await JobCache_1.default.findOneAndUpdate({ queryKey }, { jobs, fetchedAt: new Date(), ttlHours: TTL_HOURS }, { upsert: true, new: true });
}
function buildQueryKey(what, where) {
    return `${what.toLowerCase().trim()}|${where.toLowerCase().trim()}`;
}
//# sourceMappingURL=cacheService.js.map