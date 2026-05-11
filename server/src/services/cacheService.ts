import JobCache from "../models/JobCache";
import { IJob } from "../models/job";

const TTL_HOURS = Number(process.env.CACHE_TTL_HOURS) || 6;

function isStale(fetchedAt: Date, ttlHours: number): boolean {
  const ageMs = Date.now() - fetchedAt.getTime();
  return ageMs > ttlHours * 60 * 60 * 1000;
}

export async function getCached(queryKey: string): Promise<IJob[] | null> {
  const entry = await JobCache.findOne({ queryKey }).lean();
  if (!entry) return null;
  if (isStale(entry.fetchedAt, entry.ttlHours)) return null;
  return entry.jobs as IJob[];
}

export async function getCachedOrStale(
  queryKey: string,
): Promise<IJob[] | null> {
  const entry = await JobCache.findOne({ queryKey }).lean();
  if (!entry) return null;
  return entry.jobs as IJob[];
}

export async function setCached(queryKey: string, jobs: IJob[]): Promise<void> {
  await JobCache.findOneAndUpdate(
    { queryKey },
    { jobs, fetchedAt: new Date(), ttlHours: TTL_HOURS },
    { upsert: true, new: true },
  );
}

export function buildQueryKey(what: string, where: string): string {
  return `${what.toLowerCase().trim()}|${where.toLowerCase().trim()}`;
}
