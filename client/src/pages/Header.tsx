import { useEffect, useState } from "react";
import SearchBar from "../components/ui/SearchBar";
import Avatar from "../components/ui/Avatar";
import AvatarImage from "../assets/avatar.jpg";
import FilterBar from "../components/ui/FilterBar";
import type { FilterOptions, JobFilters } from "../components/ui/FilterBar";
import { useDebounce } from "../hooks/useJobs";

interface HeaderProps {
  query: string;
  onSearch: (value: string) => void;
  filters: JobFilters;
  onFilterChange: (nextFilters: Partial<JobFilters>) => void;
  onFilterReset: () => void;
  filterOptions: FilterOptions;
}

const Header = ({
  onSearch,
  filters,
  onFilterChange,
  onFilterReset,
  filterOptions,
}: HeaderProps) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 800);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (!trimmed) return;

    onSearch(trimmed);
    setSearchValue("");
  }, [debouncedSearch, onSearch]);

  return (
    <header className="header flex flex-col justify-around bg-(--bg-light) p-4 ">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold text-(--text)">
            Job Miner
          </h1>
        </div>

        <div className="flex-1 min-w-0">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search job title, company, or location"
          />
          
        </div>

        <div className="flex items-center justify-end">
          <Avatar src={AvatarImage} alt="User Avatar" />
        </div>
      </div>

      <div className="w-full">
        <FilterBar
          filters={filters}
          options={filterOptions}
          onChange={onFilterChange}
          onReset={onFilterReset}
        />
      </div>
    </header>
  );
};

export default Header;
