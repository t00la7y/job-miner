// components/ui/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  value: string;                    
  onChange: (value: string) => void; 
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search job, title, company, or location...",
}) => {
  return (
    <div className="w-[calc(100%-2rem)]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-[var(--bg-light)] border border-[var(--bg-light)] rounded-2xl 
                   text-lg shadow-sm 
                   focus:outline-none focus:border-none focus:ring-1 focus:ring-[var(--accent)]
                   transition-all duration-200 placeholder:text-gray-400"
        aria-label="Search jobs"
      />
    </div>
  );
};

export default SearchBar;