import { format, isAfter, isBefore, addDays } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const AssignmentCard = ({ 
  assignment, 
  userRole, 
  submission,
  onEdit,
  onDelete,
  onView,
  onSubmit,
  className 
}) => {
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isDueSoon = isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 3));
  const isPastDue = isBefore(dueDate, now);
  
const getStatusBadge = () => {
    if (userRole === "student") {
      if (!submission) {
        if (isPastDue) {
          return <Badge variant="danger">Past Due - Not Submitted</Badge>;
        }
        return <Badge variant="secondary">Not Started</Badge>;
      }
      
      switch (submission.status) {
        case "graded":
          return <Badge variant="primary">Graded</Badge>;
        case "submitted":
          return <Badge variant="success">Submitted</Badge>;
        case "draft":
          return <Badge variant="warning">In Progress</Badge>;
        default:
          return <Badge variant="secondary">Not Started</Badge>;
      }
    }
    
    return <Badge variant="primary">{assignment.status}</Badge>;
  };

  const getActionButton = () => {
    if (userRole !== "student") return null;

    if (!submission) {
      if (isPastDue) {
        return null; // No action for past due assignments without submission
      }
      return (
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onSubmit?.(assignment)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <ApperIcon name="Play" className="h-4 w-4 mr-2" />
          Start Assignment
        </Button>
      );
    }

    switch (submission.status) {
      case "graded":
        return (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onView?.(assignment)}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
            View Grade
          </Button>
        );
      
      case "submitted":
        return (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onView?.(assignment)}
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
            View Submission
          </Button>
        );
      
      case "draft":
        return (
          <Button 
            variant="warning" 
            size="sm" 
            onClick={() => onSubmit?.(assignment)}
            className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          >
            <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
            Continue
          </Button>
        );
      
      default:
        return (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onSubmit?.(assignment)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
            Submit Assignment
          </Button>
        );
    }
  };

  const getGradeDisplay = () => {
    if (userRole === "student" && submission?.grade !== null && submission?.grade !== undefined) {
      return (
        <div className="flex items-center text-sm font-medium">
          <ApperIcon name="Award" className="h-4 w-4 mr-1 text-amber-500" />
          <span>{submission.grade}/{assignment.points}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("p-6", className)} hover>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-gray-900">{assignment.title}</h3>
            <p className="text-sm text-gray-600">{assignment.subject}</p>
          </div>
          {getStatusBadge()}
        </div>

        <p className="text-gray-700 line-clamp-2">{assignment.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
              <span>Due {format(dueDate, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center">
              <ApperIcon name="Target" className="h-4 w-4 mr-1" />
              <span>{assignment.points} points</span>
            </div>
          </div>
          {getGradeDisplay()}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => onView?.(assignment)}>
            <ApperIcon name="Eye" className="h-4 w-4 mr-1" />
            View Details
          </Button>

          <div className="flex space-x-2">
            {userRole === "teacher" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit?.(assignment)}
                >
                  <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete?.(assignment)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                </Button>
              </>
            )}
            
{getActionButton()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentCard;