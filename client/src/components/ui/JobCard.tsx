// components/ui/JobCard.tsx
import type { Job } from "../../types";
import JobImage from "./JobImage";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      {/* Header with Company Logo */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{job.company}</p>
        </div>
        <JobImage 
          imageUrl={job.image} 
          companyName={job.company}
          className="w-12 h-12 rounded flex-shrink-0"
        />
      </div>

      {/* Job Title */}
      <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-3 text-gray-900">
        {job.title}
      </h3>

      {/* Location */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm">📍 {job.location}</p>
      </div>

      {/* Job Description (if available) */}
      {job.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-center font-medium text-sm transition-colors"
        >
          View Job
        </a>
        <button 
          className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default JobCard;