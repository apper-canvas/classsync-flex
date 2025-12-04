import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ currentRole, className, isMobile = false, onClose }) => {
  const getMenuItems = () => {
    const baseItems = [
      { path: "", icon: "LayoutDashboard", label: "Dashboard" },
      { path: "assignments", icon: "FileText", label: "Assignments" }
    ];

    if (currentRole === "teacher") {
      return [
        ...baseItems,
{ path: "students", icon: "Users", label: "Students" },
        { path: "grades", icon: "BookOpen", label: "Gradebook" },
        { path: "analytics", icon: "BarChart3", label: "Analytics" }
      ];
    } else {
      return [
        ...baseItems,
        { path: "grades", icon: "Award", label: "My Grades" },
        { path: "resources", icon: "BookOpen", label: "Resources" }
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 h-full overflow-y-auto",
        isMobile ? "w-64" : "w-64",
        className
      )}
    >
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Navigation
          </h2>
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? currentRole === "teacher"
                    ? "bg-primary-50 text-primary-700 border-l-4 border-l-primary-500"
                    : "bg-purple-50 text-purple-700 border-l-4 border-l-purple-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <ApperIcon 
              name={item.icon} 
              className="mr-3 h-5 w-5 flex-shrink-0" 
            />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 mt-6 border-t border-gray-200">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          
          {currentRole === "teacher" ? (
            <NavLink
              to="assignments/new"
              onClick={handleNavClick}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              <ApperIcon name="Plus" className="mr-3 h-5 w-5" />
              Create Assignment
            </NavLink>
          ) : (
            <div className="flex items-center px-4 py-3 text-sm text-gray-500">
              <ApperIcon name="Clock" className="mr-3 h-5 w-5" />
              Next deadline in 2 days
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;