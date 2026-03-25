import { useState, useEffect, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { Job } from '../types/index';

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  search: (what: string) => void;
  refetch: () => void;
}

export const useJobs = (initialQuery: string = 'developer'): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchJobs = useCallback(async (what: string, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsService.getJobs(what, 'south africa', signal);
      setJobs(data);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(query, controller.signal);
    return () => controller.abort();
  }, [query, fetchJobs]);

  const search = (what: string) => setQuery(what);
  const refetch = () => fetchJobs(query);

  return { jobs, loading, error, search, refetch };
};