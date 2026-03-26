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
    <div className="flex items-center w-full mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 bg-white border border-gray-300 rounded-2xl 
                   text-lg shadow-sm 
                   focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 
                   transition-all duration-200 placeholder:text-gray-400"
        aria-label="Search jobs"
      />
    </div>
  );
};

export default SearchBar;