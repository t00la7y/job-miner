import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { JobCard } from "../components/ui/JobCard";
import { ChatWidget } from "../components/ChatWidget";

const JobBoard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState({
    jobType: {
      fullTime: true,
      partTime: false,
      freelance: true,
      internship: false,
    },
    workMode: {
      remote: true,
      hybrid: true,
      onsite: false,
    },
    experienceLevel: {
      entry: true,
      graduate: true,
      mid: false,
      senior: false,
    },
    salaryRange: 20000,
    postedBy: {
      company: true,
      freelancer: true,
      recruiter: false,
    },
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Mock data - replace with real data later
  const mockJobs = [
    {
      id: "1",
      title: "Junior Frontend Developer",
      posterType: "company" as const,
      companyName: "TechCorp",
      location: "Cape Town, South Africa",
      workMode: "Remote" as const,
      jobType: "Full-time" as const,
      experienceLevel: "Entry-level" as const,
      salaryLabel: "R25,000 - R35,000",
      postedAt: "2 days ago",
      tags: ["React", "TypeScript"],
      url: "https://example.com/job1",
      source: "Adzuna",
    },
    {
      id: "2",
      title: "UX Designer",
      posterType: "freelancer" as const,
      posterName: "Kefilwe M.",
      posterInitials: "KM",
      location: "Johannesburg, South Africa",
      workMode: "Remote" as const,
      jobType: "Freelance" as const,
      experienceLevel: "Mid-level" as const,
      salaryLabel: "R30,000 - R45,000",
      postedAt: "1 week ago",
      tags: ["Figma", "User Research"],
      url: "https://example.com/job2",
      source: "Adzuna",
    },
  ];

  const handleFilterChange = (
    category: string,
    key: string,
    value: boolean | number,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [category]:
        typeof value === "boolean"
          ? { ...(prev[category as keyof typeof prev] as object), [key]: value }
          : value,
    }));
  };

  const handleSearch = () => {
    // TODO: Implement search
    console.log("Search:", { searchQuery, location });
  };

  const formatSalary = (value: number) => {
    return `R${value.toLocaleString()}/mo`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Navigation */}
      <nav className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[var(--color-text-primary)] rounded"></div>
            <span className="text-base font-medium text-[var(--color-text-primary)]">
              JobMiner
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Browse
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Saved
            </span>
            <Button size="sm" onClick={() => console.log("Post job")}>
              + Post a job
            </Button>
            <div className="w-7 h-7 bg-[var(--color-background-secondary)] border border-[var(--color-border-secondary)] rounded-full flex items-center justify-center">
              <span className="text-xs text-[var(--color-text-secondary)]">
                👤
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="border-b border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 border border-[var(--color-border-secondary)] rounded-md px-3 py-2">
            <span className="text-[var(--color-text-tertiary)]">🔍</span>
            <input
              type="text"
              placeholder="Search job title, skill, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 border border-[var(--color-border-secondary)] rounded-md px-3 py-2">
            <span className="text-[var(--color-text-tertiary)]">📍</span>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        {/* Mobile Filter Button */}
        <div className="md:hidden p-4 border-b border-[var(--color-border-tertiary)]">
          <Button variant="ghost" onClick={() => setIsFilterDrawerOpen(true)}>
            Filters
          </Button>
        </div>

        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block border-r border-[var(--color-border-tertiary)] p-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
            Filters
          </h3>

          {/* Job Type */}
          <div className="mb-4">
            <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
              Job type
            </h4>
            <div className="space-y-1">
              {Object.entries(filters.jobType).map(([key, checked]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleFilterChange("jobType", key, e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                  />
                  {key === "fullTime"
                    ? "Full-time"
                    : key === "partTime"
                      ? "Part-time"
                      : key === "freelance"
                        ? "Freelance / contract"
                        : "Internship"}
                </label>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div className="mb-4">
            <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
              Work mode
            </h4>
            <div className="space-y-1">
              {Object.entries(filters.workMode).map(([key, checked]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleFilterChange("workMode", key, e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                  />
                  {key === "remote"
                    ? "Remote"
                    : key === "hybrid"
                      ? "Hybrid"
                      : "On-site"}
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-4">
            <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
              Experience level
            </h4>
            <div className="space-y-1">
              {Object.entries(filters.experienceLevel).map(([key, checked]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleFilterChange(
                        "experienceLevel",
                        key,
                        e.target.checked,
                      )
                    }
                    className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                  />
                  {key === "entry"
                    ? "Entry-level"
                    : key === "graduate"
                      ? "Graduate"
                      : key === "mid"
                        ? "Mid-level"
                        : "Senior"}
                </label>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div className="mb-4">
            <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
              Salary range
            </h4>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={filters.salaryRange}
              onChange={(e) =>
                handleFilterChange("salaryRange", "", parseInt(e.target.value))
              }
              className="w-full accent-[var(--color-text-primary)]"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {formatSalary(filters.salaryRange)}
            </p>
          </div>

          {/* Posted By */}
          <div className="mb-4">
            <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
              Posted by
            </h4>
            <div className="space-y-1">
              {Object.entries(filters.postedBy).map(([key, checked]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleFilterChange("postedBy", key, e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                  />
                  {key === "company"
                    ? "Company"
                    : key === "freelancer"
                      ? "Freelancer"
                      : "Recruiter"}
                </label>
              ))}
            </div>
          </div>

          <button className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mt-4">
            Clear all filters
          </button>
        </div>

        {/* Job Cards */}
        <div className="p-4 col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">
                142 roles
              </span>{" "}
              match your filters
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Sort by:
              </span>
              <select className="text-xs text-[var(--color-text-secondary)] bg-transparent border-none outline-none">
                <option>Most relevant</option>
                <option>Newest</option>
                <option>Salary: High to Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {mockJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJob === job.id}
                onClick={() =>
                  setSelectedJob(selectedJob === job.id ? null : job.id)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--color-background-primary)] border-l border-[var(--color-border-tertiary)] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            {/* Copy the filter content here */}
            {/* Job Type */}
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
                Job type
              </h4>
              <div className="space-y-1">
                {Object.entries(filters.jobType).map(([key, checked]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleFilterChange("jobType", key, e.target.checked)
                      }
                      className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                    />
                    {key === "fullTime"
                      ? "Full-time"
                      : key === "partTime"
                        ? "Part-time"
                        : key === "freelance"
                          ? "Freelance / contract"
                          : "Internship"}
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
                Work mode
              </h4>
              <div className="space-y-1">
                {Object.entries(filters.workMode).map(([key, checked]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleFilterChange("workMode", key, e.target.checked)
                      }
                      className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                    />
                    {key === "remote"
                      ? "Remote"
                      : key === "hybrid"
                        ? "Hybrid"
                        : "On-site"}
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
                Experience level
              </h4>
              <div className="space-y-1">
                {Object.entries(filters.experienceLevel).map(
                  ([key, checked]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          handleFilterChange(
                            "experienceLevel",
                            key,
                            e.target.checked,
                          )
                        }
                        className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                      />
                      {key === "entry"
                        ? "Entry-level"
                        : key === "graduate"
                          ? "Graduate"
                          : key === "mid"
                            ? "Mid-level"
                            : "Senior"}
                    </label>
                  ),
                )}
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
                Salary range
              </h4>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={filters.salaryRange}
                onChange={(e) =>
                  handleFilterChange(
                    "salaryRange",
                    "",
                    parseInt(e.target.value),
                  )
                }
                className="w-full accent-[var(--color-text-primary)]"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {formatSalary(filters.salaryRange)}
              </p>
            </div>

            {/* Posted By */}
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-2">
                Posted by
              </h4>
              <div className="space-y-1">
                {Object.entries(filters.postedBy).map(([key, checked]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleFilterChange("postedBy", key, e.target.checked)
                      }
                      className="w-3.5 h-3.5 accent-[var(--color-text-primary)]"
                    />
                    {key === "company"
                      ? "Company"
                      : key === "freelancer"
                        ? "Freelancer"
                        : "Recruiter"}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1"
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // Reset filters
                  setIsFilterDrawerOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
      <ChatWidget />
    </div>
  );
};

export default JobBoard;
