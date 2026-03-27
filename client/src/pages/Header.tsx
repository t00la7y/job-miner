import SearchBar from "../components/ui/SearchBar";  
import Avatar from "../components/ui/Avatar";
import AvatarImage from "../assets/avatar.jpg";

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
}

const Header = ({ query, onQueryChange }: HeaderProps) => {
  return (
    <header className="header flex items-center">
      
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
          Job Miner
        </h1>
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
        <Avatar src={AvatarImage} alt="User Avatar"/>
      </div>
    </header>
  );
};

export default Header;