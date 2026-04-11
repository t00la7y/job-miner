import { useState } from "react";
import JobCard from "../components/ui/JobCard";
import JobPost from "../components/ui/JobPost";
import { useJobs } from "../hooks/useJobs";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import type { Job } from "../types";
import { useDebounce } from "../hooks/useJobs";

interface JobBoardProps {
  query?: string;
}

const JobBoard = ({ query = "developer" }: JobBoardProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const debouncedQuery = useDebounce(query, 1500);

  const { jobs, loading, error } = useJobs(debouncedQuery);

  return (
    <div className="w-full h-full flex-1 flex overflow-hidden bg-[var(--bg-dark)]">
      {/* Left: Job Grid with Infinite Scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[var(--text-dark)]">
              {debouncedQuery}
            </h2>
            <p className="text-gray-600 mt-2">
              {!loading && jobs.length > 0 && `Found ${jobs.length} jobs`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Job Grid */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.url}
                  job={job}
                  onClick={() => setSelectedJob(job)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No jobs found. Try a different search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Job Detail Panel (dynamic SPA) - Type Guard */}
      {selectedJob && (
        <div className="w-full md:w-2/5 border-l border-gray-200 overflow-hidden bg-white flex flex-col md:flex-col">
          <JobPost job={selectedJob} onClose={() => setSelectedJob(null)} />
        </div>
      )}
    </div>
  );
};

export default JobBoard;
