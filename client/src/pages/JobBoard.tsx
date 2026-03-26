import { useState } from "react";
import JobCard from "../components/ui/JobCard";
import JobPost from "../components/ui/JobPost";
import FilterPanel from "../components/ui/FilterPanel";

const JobBoard = () => {
    const [selectedJob, setSelectedJob] = useState(null);   // For showing JobPost
    const [jobs, setJobs] = useState([]);                   // or use your hook
  
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Job Grid with Infinite Scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <FilterPanel />
          
          <div className="job-grid">           {/* Infinite scroll container */}
            {jobs.map(job => (
              <JobCard 
                key={job.url} 
                job={job} 
                onClick={() => setSelectedJob(job)}   // ← Open details
              />
            ))}
          </div>
        </div>
  
        {/* Right: Job Detail Panel (dynamic) */}
        {selectedJob && (
          <div className="w-2/5 border-l border-gray-700 overflow-y-auto">
            <JobPost job={selectedJob} onClose={() => setSelectedJob(null)} />
          </div>
        )}
      </div>
    );
  };