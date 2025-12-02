import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ErrorView = ({ 
  error = "Something went wrong", 
  onRetry,
  className 
}) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-8", className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center">
          <ApperIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">Oops! Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        
        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full sm:w-auto">
              <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <div className="text-sm text-gray-500">
            If this problem persists, please contact support.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;