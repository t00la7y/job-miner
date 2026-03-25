// src/App.tsx
import { useState, useEffect } from "react";
import { useJobs } from "./hooks/useJobs";

import SearchBar from "./components/ui/Searchbar";
// import Navbar from "./components/ui/Navbar";
// import FilterPanel from "./components/ui/FilterPanel";
// import JobCard from "./components/ui/JobCard";
// import LoadingSkeleton from "./components/ui/LoadingSkeleton";

import "./index.css";

function App() {
  // 1. What the user is currently typing
  const [query, setQuery] = useState("");

  // 2. What actually gets sent to the backend (debounced)
  const [searchTerm, setSearchTerm] = useState("developer");

  const { jobs, loading, error } = useJobs(searchTerm);

  // Debounce logic - waits 450ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      setSearchTerm(trimmed || "developer"); // fallback if user clears the search
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  if (error) {
    return (
      <div className="p-8 text-red-500 text-center text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Job Miner
          </h1>
          <p className="text-gray-600 text-lg">
            Discover your next opportunity
          </p>
        </div>

        {/* SearchBar */}
        <SearchBar 
          value={query} 
          onChange={setQuery} 
        />

        {/* Results count */}
        <p className="text-gray-600 mt-4 mb-8">
          {loading ? "Mining jobs..." : `Found ${jobs.length} jobs`}
          {searchTerm && searchTerm !== "developer" && ` for "${searchTerm}"`}
        </p>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setQuery("Frontend Developer")}
            className="px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-blue-50 transition-colors font-medium"
          >
            Frontend
          </button>
          <button
            onClick={() => setQuery("Backend Developer")}
            className="px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-blue-50 transition-colors font-medium"
          >
            Backend
          </button>
          <button
            onClick={() => setQuery("Fullstack Developer")}
            className="px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-blue-50 transition-colors font-medium"
          >
            Fullstack
          </button>
          <button
            onClick={() => setQuery("Data Analyst")}
            className="px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-blue-50 transition-colors font-medium"
          >
            Data Analyst
          </button>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">
            Loading jobs...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length > 0 ? (
              jobs.slice(0, 12).map((job, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 pr-2">
                      {job.title}
                    </h3>
                    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">
                      {job.source}
                    </span>
                  </div>

                  <p className="text-gray-700 font-medium">{job.company}</p>
                  <p className="text-gray-500 text-sm mt-1">{job.location}</p>

                  <div className="mt-8 flex gap-3">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-3.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Apply Now
                    </a>
                    <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-3.5 rounded-xl text-sm font-medium transition-colors">
                      Save for Later
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                No jobs found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;