import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
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
import Badge from "@/components/atoms/Badge";
import StudentForm from "@/components/organisms/StudentForm";
import Grades from "@/components/pages/Grades";
import StudentRow from "@/components/molecules/StudentRow";
const Students = () => {
  const { currentRole } = useOutletContext();
const navigate = useNavigate();
const [showStudentForm, setShowStudentForm] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  };

  const handleViewGrades = (student) => {
    // Navigate to student-specific grades view
    navigate(`/grades/${student.Id}`);
  };

  const handleEditStudent = () => {
    setShowStudentDetail(false);
    setShowStudentForm(true);
  };

  const handleDeleteClick = () => {
    setShowStudentDetail(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.delete(selectedStudent.Id);
      setStudents(prev => prev.filter(s => s.Id !== selectedStudent.Id));
      toast.success('Student deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleCloseModals = () => {
    setShowStudentDetail(false);
    setShowStudentForm(false);
    setShowDeleteConfirm(false);
    setSelectedStudent(null);
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

  const handleFormSave = () => {
    setShowStudentForm(false);
    setSelectedStudent(null);
    loadStudentsData();
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
                    Grade Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes Enrolled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
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
                    onStudentClick={handleStudentClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
)}
      </Card>

{/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Student ID: {selectedStudent.studentId || 'N/A'}</span>
                    <span>•</span>
                    <span>Grade Level: {selectedStudent.gradeLevel || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {getStudentStats(selectedStudent.Id).assignmentsCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {getStudentStats(selectedStudent.Id).assignmentsPending}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedStudent.overallGPA ? selectedStudent.overallGPA.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">GPA</div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{selectedStudent.currentStatus || 'Active'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Enrollment Date</label>
                  <p className="text-gray-900">
                    {selectedStudent.enrollmentDate 
                      ? format(new Date(selectedStudent.enrollmentDate), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
                {selectedStudent.classesEnrolled && selectedStudent.classesEnrolled.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enrolled Classes</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStudent.classesEnrolled.map((classId, index) => (
                        <Badge key={index} variant="secondary">
                          Class {classId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleEditStudent}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                    Edit Student
                  </Button>
                  <Button
                    onClick={() => handleViewGrades(selectedStudent)}
                    variant="outline"
                  >
                    <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
                    View Grades
                  </Button>
                </div>
                <Button
                  onClick={handleDeleteClick}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{selectedStudent.name}</strong>? This will permanently remove the student and all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Student
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
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
                student={selectedStudent}
                onSave={handleFormSave}
                onCancel={handleCloseModals}
              />
            </div>
          </div>
        </div>
)}
    </div>
  );
};

export default Students;