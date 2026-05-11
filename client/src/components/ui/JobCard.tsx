import { useState } from "react";
import { Heart, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PosterType = "company" | "freelancer" | "recruiter";
export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type JobType =
  | "Full-time"
  | "Part-time"
  | "Freelance"
  | "Contract"
  | "Internship";

export interface Job {
  id: string;
  title: string;
  posterType: PosterType;
  // Company / recruiter fields
  companyName?: string;
  companyLogoUrl?: string;
  // Freelancer fields
  posterName?: string;
  posterInitials?: string;
  // Shared
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  experienceLevel: "Entry-level" | "Graduate" | "Mid-level" | "Senior";
  salaryLabel: string;
  postedAt: string; // human-readable, e.g. "2 days ago"
  tags?: string[];
  url?: string;
  source?: string;
}

interface JobCardProps {
  job: Job;
  selected?: boolean;
  onClick?: () => void;
}

const WORK_MODE_STYLES: Record<WorkMode, string> = {
  Remote: "bg-teal-50 text-teal-800 border-teal-200",
  Hybrid: "bg-amber-50 text-amber-800 border-amber-200",
  "On-site": "bg-gray-100 text-gray-600 border-gray-200",
};

const JOB_TYPE_STYLES: Record<JobType, string> = {
  "Full-time": "bg-gray-100 text-gray-600 border-gray-200",
  "Part-time": "bg-gray-100 text-gray-600 border-gray-200",
  Freelance: "bg-teal-50 text-teal-800 border-teal-200",
  Contract: "bg-amber-50 text-amber-800 border-amber-200",
  Internship: "bg-purple-50 text-purple-800 border-purple-200",
};

function Badge({ label, style }: { label: string; style: string }) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border",
        style,
      )}
    >
      {label}
    </span>
  );
}

export function JobCard({ job, selected = false, onClick }: JobCardProps) {
  const [saved, setSaved] = useState(false);
  const isFreelancerPost = job.posterType === "freelancer";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border p-4 cursor-pointer transition-all duration-150",
        selected
          ? "border-gray-900 border-[1.5px] shadow-none"
          : "border-gray-200 hover:border-gray-400",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 items-start min-w-0">
          {/* Logo / Avatar */}
          {isFreelancerPost ? (
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[11px] font-semibold text-teal-800 flex-shrink-0">
              {job.posterInitials ?? "?"}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
              {job.companyLogoUrl ? (
                <img
                  src={job.companyLogoUrl}
                  alt={job.companyName}
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>
          )}

          {/* Title & poster */}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 leading-snug truncate">
              {job.title}
            </p>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {isFreelancerPost
                ? `Posted by ${job.posterName ?? "Freelancer"}`
                : job.companyName}{" "}
              ·{" "}
              <span className="inline-flex items-center gap-0.5">
                <MapPin size={10} className="inline" />
                {job.location}
              </span>
            </p>
          </div>
        </div>

        {/* Save button */}
        <button
          aria-label={saved ? "Unsave job" : "Save job"}
          onClick={(e) => {
            e.stopPropagation();
            setSaved((s) => !s);
          }}
          className={cn(
            "flex-shrink-0 p-1.5 rounded-md border transition-colors",
            saved
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600",
          )}
        >
          <Heart size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge label={job.workMode} style={WORK_MODE_STYLES[job.workMode]} />
        <Badge label={job.jobType} style={JOB_TYPE_STYLES[job.jobType]} />
        {job.experienceLevel && (
          <Badge
            label={job.experienceLevel}
            style="bg-gray-100 text-gray-600 border-gray-200"
          />
        )}
        {job.tags?.map((tag) => (
          <Badge
            key={tag}
            label={tag}
            style="bg-gray-100 text-gray-500 border-gray-200"
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-[12px] text-gray-600 font-medium">
          {job.salaryLabel}
        </span>
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock size={10} />
          {job.postedAt}
        </span>
      </div>
    </div>
  );
}
