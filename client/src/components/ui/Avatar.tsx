// components/ui/Avatar.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = ({ src, alt = "User Avatar", size = "md" }: AvatarProps) => {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="relative group cursor-pointer">
      
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-purple-500/30 hover:border-purple-400 transition-all duration-300`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/128/6B7280/FFFFFF?text=👤";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="bg-transparent border border-none p-1 rounded-full shadow-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-purple-300" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Avatar;
