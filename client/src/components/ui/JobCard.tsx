// components/ui/JobCard.tsx
import type { Job } from "../../types";
import JobImage from "./JobImage";

const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="w-24">

      {/* You can now easily change height, add padding, etc. */}
      <div className="flex-row">
        <p>{job.company}</p>
        <JobImage 
        imageUrl={job.image} 
        companyName={job.company}
        className="w-24 h-24"     
      />
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-semibold text-xl leading-tight line-clamp-2 mb-4 text-gray-900">
          {job.title}
        </h3>

        <div className="space-y-1 mb-8">
          <p className="font-medium text-gray-800">{job.company}</p>
          <p className="text-gray-500 text-sm">📍 {job.location}</p>
        </div>

        <div className="mt-auto pt-4 flex gap-3">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-center font-medium text-sm transition-colors"
          >
            Apply Now
          </a>
          <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-3.5 rounded-2xl text-sm font-medium transition-colors">
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;