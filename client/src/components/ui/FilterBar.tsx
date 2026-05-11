export interface JobFilters {
  company: string;
  country: string;
  salaryRange: string;
  includeNoSalary: boolean;
}

export interface FilterOptions {
  companies: string[];
  countries: string[];
  salaryRanges: string[];
}

interface FilterBarProps {
  filters: JobFilters;
  options: FilterOptions;
  onChange: (nextFilters: Partial<JobFilters>) => void;
  onReset: () => void;
}

const labelForValue = (
  value: string,
  type: "company" | "country" | "salary",
) => {
  if (value === "all") {
    if (type === "company") return "Company";
    if (type === "country") return "Country";
    return "Salary range";
  }

  if (value === "No salary") return "No salary";
  return value;
};

const FilterBar: React.FC<FilterBarProps> = ({ filters, options, onChange }) => {
  return (
    <section className="flex flex-col bg-transparent w-full">
      
      <div className="flex flex-row gap-7 py-2 space-y-4">
        <div className="space-y-2">
          <select
            value={filters.company}
            onChange={(event) => onChange({ company: event.target.value })}
            className="w-full rounded-2xl border border-(--bg) bg-(--bg) px-4 py-3 text-sm text-(--text-light) shadow-sm focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
          >
            {options.companies.map((company) => (
              <option key={company} value={company}>
                {labelForValue(company, "company")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <select
            value={filters.country}
            onChange={(event) => onChange({ country: event.target.value })}
            className="w-full rounded-2xl border border-(--bg) bg-(--bg) px-4 py-3 text-sm text-(--text-light) shadow-sm focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
          >
            {options.countries.map((country) => (
              <option key={country} value={country}>
                {labelForValue(country, "country")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <select
            value={filters.salaryRange}
            onChange={(event) => onChange({ salaryRange: event.target.value })}
            className="w-full rounded-2xl border border-(--bg) bg-(--bg) px-4 py-3 text-sm text-(--text-light) shadow-sm focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
          >
            {options.salaryRanges.map((range) => (
              <option key={range} value={range}>
                {labelForValue(range, "salary")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
