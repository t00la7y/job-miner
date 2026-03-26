import SearchBar from "../components/ui/SearchBar";  
import Avatar from "../components/ui/Avatar";

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
}

const Header = ({ query, onQueryChange }: HeaderProps) => {
  return (
    <header className="header flex items-center">
      
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <h2 className="">
          Job Miner
        </h2>
      </div>

      {/* Search Bar - Centered and flexible */}
      <div className="flex-1 max-w-xl mx-8">
        <SearchBar 
          value={query} 
          onChange={onQueryChange} 
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <Avatar src="https://your-image-url.jpg" size="md"/>
      </div>
    </header>
  );
};

export default Header;