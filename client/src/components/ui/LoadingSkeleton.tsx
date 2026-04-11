// components/ui/LoadingSkeleton.tsx
const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      {/* Header with Avatar */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Title */}
      <div className="h-6 bg-gray-200 rounded mb-3"></div>
      
      {/* Subtitle */}
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
