import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";
import assignmentService from "@/services/api/assignmentService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Grades from "@/components/pages/Grades";
import StudentRow from "@/components/molecules/StudentRow";
import StudentForm from "@/components/organisms/StudentForm";
const Students = () => {
  const { currentRole } = useOutletContext();
const navigate = useNavigate();
  const [showStudentForm, setShowStudentForm] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentRole !== "teacher") {
      navigate("/dashboard");
      return;
    }
    
    loadStudentsData();
  }, [currentRole]);

  const loadStudentsData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [studentsData, assignmentsData, submissionsData] = await Promise.all([
        userService.getByRole("student"),
        assignmentService.getActiveAssignments(),
        submissionService.getAll()
      ]);
      
      setStudents(studentsData);
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Error loading students data:", err);
      setError("Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  const getStudentStats = (studentId) => {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);
    const totalAssignments = assignments.length;
    const submittedAssignments = studentSubmissions.filter(s => s.status !== "pending").length;
    const grades = studentSubmissions
      .filter(s => s.grade !== null && s.grade !== undefined)
      .map(s => s.grade);
    
    return {
      totalAssignments,
      submittedAssignments,
      grades
    };
  };

  const getFilteredStudents = () => {
    if (!searchTerm) return students;
    
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

const handleViewGrades = (student) => {
    // Navigate to student-specific grades view
    navigate(`/grades/${student.Id}`);
  };

  const handleRemoveStudent = async (student) => {
    if (!confirm(`Are you sure you want to remove ${student.name} from the class?`)) {
      return;
    }

    try {
      // In a real app, this would remove from class, not delete the user
      toast.success(`${student.name} has been removed from the class`);
      setStudents(prev => prev.filter(s => s.Id !== student.Id));
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  if (currentRole !== "teacher") {
    return <ErrorView error="Access denied. Only teachers can view student management." />;
  }

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadStudentsData} />;

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage your students' progress</p>
        </div>

<Button onClick={() => setShowStudentForm(true)}>
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 mr-4">
              <ApperIcon name="Users" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-4">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0 ? Math.round(
                  students.reduce((sum, student) => {
                    const stats = getStudentStats(student.Id);
                    return sum + (stats.totalAssignments > 0 ? (stats.submittedAssignments / stats.totalAssignments) * 100 : 0);
                  }, 0) / students.length
                ) : 0}%
              </p>
              <p className="text-sm text-gray-600">Avg Completion</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-4">
              <ApperIcon name="Award" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === "graded").length}
              </p>
              <p className="text-sm text-gray-600">Grades Given</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 mr-4">
              <ApperIcon name="Clock" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === "submitted").length}
              </p>
              <p className="text-sm text-gray-600">Pending Reviews</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative max-w-md">
          <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Students Table */}
      <Card className="overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-6">
<Empty 
              icon="Users"
              title={searchTerm ? "No matching students found" : "No students enrolled"}
              description={searchTerm ? "Try adjusting your search criteria" : "Add students to your class to get started"}
              actionLabel={!searchTerm ? "Add Student" : undefined}
              onAction={!searchTerm ? () => setShowStudentForm(true) : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <StudentRow
                    key={student.Id}
                    student={student}
                    stats={getStudentStats(student.Id)}
                    onViewGrades={handleViewGrades}
                    onRemove={handleRemoveStudent}
                  />
                ))}
              </tbody>
            </table>
          </div>
)}
      </Card>

      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add New Student</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowStudentForm(false)}
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <StudentForm
                onSave={() => {
                  setShowStudentForm(false);
                  loadStudentsData();
                }}
                onCancel={() => setShowStudentForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;