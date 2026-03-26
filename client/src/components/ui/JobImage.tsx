// components/ui/JobImage.tsx
interface JobImageProps {
  imageUrl?: string | null;
  companyName: string;
  className?: string;        // ← This lets you pass custom styles
}

const JobImage = ({ imageUrl, companyName, className = "" }: JobImageProps) => {
  return (
    <div className={`bg-gray-100 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${companyName} logo`}
          className="bg-white"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x200/gray/white?text=No+Logo";
          }}
        />
      ) : (
        // Fallback with company initial
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
          <span className="text-white text-6xl font-bold tracking-tighter">
            {companyName?.charAt(0)?.toUpperCase() || "J"}
          </span>
        </div>
      )}
    </div>
  );
};

export default JobImage;