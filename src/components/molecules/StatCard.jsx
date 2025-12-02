import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  gradient = "blue"
}) => {
  const gradients = {
    blue: "from-primary-500 to-primary-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <Card className={cn("p-6 hover:shadow-card-hover transition-shadow duration-200", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center text-sm">
              <ApperIcon 
                name={trend.direction === "up" ? "TrendingUp" : "TrendingDown"} 
                className={cn(
                  "mr-1 h-4 w-4",
                  trend.direction === "up" ? "text-emerald-600" : "text-red-600"
                )}
              />
              <span className={cn(
                "font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-600"
              )}>
                {trend.value}
              </span>
              <span className="text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r text-white shadow-md",
          gradients[gradient]
        )}>
          <ApperIcon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;