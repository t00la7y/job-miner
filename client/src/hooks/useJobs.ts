import { useState, useEffect, useCallback } from "react";
import { jobsService } from "../services/jobsService";
import type { Job } from "../types/index";

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  search: (what: string) => void;
  refetch: () => void;
}

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const useJobs = (initialQuery: string = ""): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (what: string, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const trimmed = what?.trim();
      if (!trimmed) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const data = await jobsService.getJobs(trimmed, "", signal);
      setJobs(data);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      const errorMessage =
        err?.message || "An unexpected error occurred while fetching jobs";
      setError(errorMessage);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(initialQuery, controller.signal);
    return () => controller.abort();
  }, [initialQuery, fetchJobs]);

  const search = useCallback(
    (what: string) => {
      fetchJobs(what);
    },
    [fetchJobs],
  );

  const refetch = useCallback(() => {
    fetchJobs(initialQuery);
  }, [fetchJobs, initialQuery]);

  return { jobs, loading, error, search, refetch };
};
