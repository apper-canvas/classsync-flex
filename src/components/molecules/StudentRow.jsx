import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const StudentRow = ({ student, stats, onViewGrades, onRemove, onStudentClick }) => {
  const getAverageGrade = () => {
    if (student.overallGPA) return student.overallGPA.toFixed(1);
    if (!stats?.grades || stats.grades.length === 0) return "N/A";
    const average = stats.grades.reduce((sum, grade) => sum + grade, 0) / stats.grades.length;
    return Math.round(average);
  };

  const getStatusBadge = (status) => {
    const variants = {
      "Active": "success",
      "Inactive": "secondary", 
      "Suspended": "danger"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getCompletionRate = () => {
    if (!stats) return "N/A";
    if (stats.totalAssignments === 0) return "100%";
    return `${Math.round((stats.submittedAssignments / stats.totalAssignments) * 100)}%`;
  };

return (
    <tr className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => onStudentClick?.(student)}>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {student.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{student.gradeLevel || "N/A"}</div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {student.classesEnrolled ? 
            `${student.classesEnrolled.length} classes` : 
            "N/A"
          }
        </div>
        {student.classesEnrolled && student.classesEnrolled.length > 0 && (
          <div className="text-xs text-gray-500">
            {student.classesEnrolled.slice(0, 2).join(", ")}
            {student.classesEnrolled.length > 2 && ` +${student.classesEnrolled.length - 2}`}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center">
          <ApperIcon name="Target" className="h-4 w-4 mr-1 text-amber-500" />
          <span className="text-sm font-medium">{getAverageGrade()}</span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        {getStatusBadge(student.currentStatus || "Active")}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center">
          <ApperIcon name="CheckCircle" className="h-4 w-4 mr-1 text-emerald-500" />
          <span className="text-sm">{getCompletionRate()}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
<Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewGrades?.(student);
            }}
          >
            <ApperIcon name="Eye" className="h-4 w-4 mr-1" />
            View Grades
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove?.(student)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="UserMinus" className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;