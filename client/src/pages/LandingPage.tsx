import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Briefcase,
  Code,
  Palette,
  BarChart2,
  PenLine,
  Building2,
  Wifi,
} from "lucide-react";
import { JobCard, type Job } from "@/components/ui/JobCard";

const FEATURED_JOBS: Job[] = [
  {
    id: "1",
    title: "Junior Frontend Developer",
    posterType: "company",
    companyName: "Acme Corp",
    location: "Cape Town",
    workMode: "Remote",
    jobType: "Full-time",
    experienceLevel: "Entry-level",
    salaryLabel: "R18k – R24k/mo",
    postedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Brand & Visual Designer",
    posterType: "company",
    companyName: "Studio Blank",
    location: "Johannesburg",
    workMode: "On-site",
    jobType: "Full-time",
    experienceLevel: "Graduate",
    salaryLabel: "R15k – R20k/mo",
    postedAt: "5 days ago",
  },
  {
    id: "3",
    title: "Copywriter — 3-month contract",
    posterType: "freelancer",
    posterName: "Kefilwe M.",
    posterInitials: "KM",
    location: "Remote",
    workMode: "Remote",
    jobType: "Contract",
    experienceLevel: "Mid-level",
    salaryLabel: "R800/day · negotiable",
    postedAt: "1 day ago",
  },
];

const TRENDING = [
  { label: "Junior developer", Icon: Code },
  { label: "UX designer", Icon: Palette },
  { label: "Data analyst", Icon: BarChart2 },
  { label: "Content writer", Icon: PenLine },
  { label: "Marketing grad", Icon: Building2 },
  { label: "Remote only", Icon: Wifi },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-[5px]" />
            <span className="text-[15px] font-medium text-gray-900">
              JobMiner
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => navigate("/jobs")}
              className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Find work
            </button>
            <button
              onClick={() => navigate("/jobs/post")}
              className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Post a job
            </button>
            <button
              onClick={() => navigate("/jobs")}
              className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Browse
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-[13px] px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-[13px] px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <span className="inline-block text-[11px] font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 mb-5">
          Now open to freelancers
        </span>
        <h1 className="text-[clamp(28px,5vw,48px)] font-medium text-gray-900 leading-[1.2] mb-5 max-w-xl">
          Your first job.
          <br />
          Found faster.
        </h1>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-8 max-w-md">
          Browse thousands of graduate-friendly roles. Get matched by a smart
          assistant that learns what you actually want.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 text-[13px] px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Get started — it's free
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 text-[13px] px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Browse jobs
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mt-3">
          No credit card. No CV upload required to start.
        </p>
      </section>

      <div className="border-t border-gray-100" />

      {/* Trending */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-4">
          Trending searches
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => navigate(`/jobs?q=${encodeURIComponent(label)}`)}
              className="flex items-center gap-1.5 text-[12px] text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              <Icon size={12} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* Featured roles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            Featured roles
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="text-[12px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            See all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURED_JOBS.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => navigate("/jobs")} />
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* Dual audience */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-5">
          Who is this for?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="p-5 border border-gray-200 rounded-xl">
            <Search size={20} className="text-gray-400 mb-3" aria-hidden />
            <p className="text-[13px] font-medium text-gray-900 mb-1.5">
              Freelancers & grads
            </p>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              Find your first role or your next contract. Post your own
              availability too.
            </p>
          </div>
          <div className="p-5 border border-gray-200 rounded-xl">
            <Briefcase size={20} className="text-gray-400 mb-3" aria-hidden />
            <p className="text-[13px] font-medium text-gray-900 mb-1.5">
              Recruiters & companies
            </p>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              Post roles and reach pre-screened, motivated candidates.
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[12px] text-gray-400">© 2025 JobMiner</span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Contact"].map((item) => (
            <button
              key={item}
              className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
