import { useState } from "react";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import RoleToggle from "@/components/molecules/RoleToggle";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ currentRole, onRoleChange, onMobileMenuToggle }) => {
  const [currentUser] = useState({
    name: currentRole === "teacher" ? "John Smith" : "Alice Johnson",
    email: currentRole === "teacher" ? "john.smith@school.edu" : "alice.johnson@student.edu"
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              ClassSync
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block">
            <RoleToggle 
              currentRole={currentRole} 
              onRoleChange={onRoleChange}
            />
          </div>

          <div className="flex items-center space-x-3">
            <Badge 
              variant={currentRole === "teacher" ? "primary" : "purple"}
              className="hidden sm:inline-flex"
            >
              {currentRole === "teacher" ? "Teacher" : "Student"}
            </Badge>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile role toggle */}
      <div className="sm:hidden px-4 pb-3">
        <RoleToggle 
          currentRole={currentRole} 
          onRoleChange={onRoleChange}
          className="w-full"
        />
      </div>
    </header>
  );
};

export default Header;