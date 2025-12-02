import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const RoleToggle = ({ currentRole, onRoleChange, className }) => {
  return (
    <div className={cn("flex items-center space-x-2 bg-gray-100 rounded-lg p-1", className)}>
      <Button
        variant={currentRole === "teacher" ? "primary" : "ghost"}
        size="sm"
        onClick={() => onRoleChange("teacher")}
        className={cn(
          "flex-1 justify-center",
          currentRole === "teacher" ? "" : "text-gray-600 hover:text-gray-900"
        )}
      >
        <ApperIcon name="GraduationCap" className="h-4 w-4 mr-1" />
        Teacher
      </Button>
      
      <Button
        variant={currentRole === "student" ? "purple" : "ghost"}
        size="sm"
        onClick={() => onRoleChange("student")}
        className={cn(
          "flex-1 justify-center",
          currentRole === "student" ? "" : "text-gray-600 hover:text-gray-900"
        )}
      >
        <ApperIcon name="BookOpen" className="h-4 w-4 mr-1" />
        Student
      </Button>
    </div>
  );
};

export default RoleToggle;