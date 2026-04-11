// components/ui/Avatar.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
}

const Avatar = ({ src, alt = "User" }: AvatarProps) => {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="relative group cursor-pointer">

      {/* EXPANDING CONTAINER */}
      <div className="flex items-center justify-around bg-transparent border border-transparent group-hover:border-[var(--accent)] group-hover:bg-transparent group-hover:p-1 rounded-full p-0.25 w-12 group-hover:w-48 transition-all duration-300 overflow-hidden">

        {/* AVATAR */}

        <div className="w-10 h-10 justify-between rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-[var(--accent)] transition-all duration-300">
          {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover bg-transparent" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-500 text-white font-bold">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

          <span className="text-m font-semibold text-[var(--text)] px-1.5">User</span>

        {/* HIDDEN CONTENT */}
        <div className="ml-3 flex items-center gap-2 opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="p-1 rounded-full"
          >
            {isDark ? (
              <Sun size={16} className="text-yellow-400" />
            ) : (
              <Moon size={16} className="text-purple-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
