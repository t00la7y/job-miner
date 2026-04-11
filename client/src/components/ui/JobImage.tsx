// components/ui/JobImage.tsx
interface JobImageProps {
  imageUrl?: string | null;
  companyName: string;
  className?: string;
}

const JobImage = ({ imageUrl, companyName, className = "" }: JobImageProps) => {
  return (
    <div className={`rounded overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center ${className}`}>
      {imageUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt={`${companyName} logo`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const badge = parent.querySelector(".fallback-badge");
                if (badge) badge.classList.remove("hidden");
              }
            }}
          />
          {/* White overlay filter */}
          <div className="absolute inset-0 bg-white/20 pointer-events-none" />
        </div>
      ) : (
        // Fallback with company initial badge
        <div className="fallback-badge w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {companyName?.charAt(0)?.toUpperCase() || "J"}
          </span>
        </div>
      )}
    </div>
  );
};

export default JobImage;