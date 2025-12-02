import { cn } from "@/utils/cn";

const Loading = ({ className, type = "default" }) => {
  if (type === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-card">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", className)}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-r-purple-600 animate-spin mx-auto" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Loading ClassSync</h3>
          <p className="text-gray-600">Preparing your educational experience...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;