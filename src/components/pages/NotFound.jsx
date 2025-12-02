import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 flex items-center justify-center">
            <ApperIcon name="AlertCircle" className="h-12 w-12 text-primary-600" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center">
            <ApperIcon name="X" className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off to a different classroom. 
            Let's get you back to your studies.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            <ApperIcon name="Home" className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/assignments")}
            >
              Assignments
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/grades")}
            >
              Grades
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/resources")}
            >
              Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;