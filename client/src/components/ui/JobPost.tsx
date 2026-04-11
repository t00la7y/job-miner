// components/ui/JobPost.tsx
import { ChevronLeft, ExternalLink, BookmarkPlus } from "lucide-react";
import type { Job } from "../../types";

interface JobPostProps {
  job: Job;
  onClose: () => void;
}

const JobPost = ({ job, onClose }: JobPostProps) => {
  const handleSaveJob = () => {
    // TODO: Implement save job functionality
    alert(`Saved: ${job.title}`);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Back Button */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
          <span className="font-medium">Back</span>
        </button>
        <button
          onClick={handleSaveJob}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <BookmarkPlus size={20} />
          <span className="text-sm font-medium">Save</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Company Header */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0">
              {job.image ? (
                <img
                  src={job.image}
                  alt={job.company}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {job.company?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 uppercase tracking-wider">{job.company}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{job.title}</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-1">
                📍 {job.location}
              </p>
            </div>
          </div>
        </div>

        {/* Job Type & Salary (if available) */}
        <div className="grid grid-cols-2 gap-4">
          {job.type && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Job Type</p>
              <p className="font-semibold text-gray-900">{job.type}</p>
            </div>
          )}
          {job.salary && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Salary Range</p>
              <p className="font-semibold text-gray-900">{job.salary}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">About This Job</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>
        )}

        {/* Requirements Section (if available) */}
        {job.requirements && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Requirements</h2>
            <ul className="space-y-2 text-gray-700">
              {(Array.isArray(job.requirements)
                ? job.requirements
                : job.requirements.split("\n")
              ).map((req: string, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags/Skills */}
        {job.tags && job.tags.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Skills Needed</h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posted Date */}
        {job.postedDate && (
          <div className="text-sm text-gray-500">
            Posted on {new Date(job.postedDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Footer with CTA Button */}
      <div className="border-t border-gray-200 p-4 sticky bottom-0 bg-white">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Apply on {job.company}
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};

export default JobPost;
