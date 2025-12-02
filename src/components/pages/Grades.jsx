import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";

const Grades = () => {
  const { currentRole } = useOutletContext();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const studentId = 2; // Mock student ID

  useEffect(() => {
    if (currentRole !== "student") {
      return;
    }
    
    loadGradesData();
  }, [currentRole]);

  const loadGradesData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentService.getActiveAssignments(),
        submissionService.getByStudentId(studentId)
      ]);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Error loading grades data:", err);
      setError("Failed to load grades data");
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentWithGrade = () => {
    return assignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment.Id);
      return {
        ...assignment,
        submission,
        grade: submission?.grade || null,
        status: submission?.status || "not_submitted",
        feedback: submission?.feedback || null,
        submittedAt: submission?.submittedAt || null
      };
    });
  };

  const getFilteredAssignments = () => {
    let filtered = getAssignmentWithGrade();

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

    return filtered;
  };

  const getGradeStats = () => {
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
    if (gradedSubmissions.length === 0) return { average: 0, total: 0, percentage: 0 };

    const totalPoints = gradedSubmissions.reduce((sum, s) => {
      const assignment = assignments.find(a => a.Id === s.assignmentId);
      return sum + (assignment?.points || 0);
    }, 0);

    const earnedPoints = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0);
    
    return {
      average: Math.round(earnedPoints / gradedSubmissions.length),
      total: gradedSubmissions.length,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    };
  };

  const getStatusBadge = (status, grade, points) => {
    switch (status) {
      case "graded":
        const percentage = points > 0 ? Math.round((grade / points) * 100) : 0;
        if (percentage >= 90) return <Badge variant="success">A ({percentage}%)</Badge>;
        if (percentage >= 80) return <Badge variant="primary">B ({percentage}%)</Badge>;
        if (percentage >= 70) return <Badge variant="warning">C ({percentage}%)</Badge>;
        if (percentage >= 60) return <Badge variant="danger">D ({percentage}%)</Badge>;
        return <Badge variant="danger">F ({percentage}%)</Badge>;
      case "submitted":
        return <Badge variant="info">Pending</Badge>;
      case "not_submitted":
        return <Badge variant="danger">Not Submitted</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getUniqueSubjects = () => {
    return [...new Set(assignments.map(a => a.subject))].sort();
  };

  if (currentRole !== "student") {
    return <ErrorView error="Access denied. Only students can view grades." />;
  }

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadGradesData} />;

  const filteredAssignments = getFilteredAssignments();
  const subjects = getUniqueSubjects();
  const stats = getGradeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          My Grades
        </h1>
        <p className="text-gray-600 mt-2">Track your academic progress and performance</p>
      </div>

      {/* Grade Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 mr-4">
              <ApperIcon name="Award" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
              <p className="text-sm text-gray-600">Overall Grade</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-4">
              <ApperIcon name="CheckCircle" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Graded Assignments</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-4">
              <ApperIcon name="Target" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.average}</p>
              <p className="text-sm text-gray-600">Avg Points</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-4">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length > 0 ? Math.round((submissions.length / assignments.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>

          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Status</option>
            <option value="graded">Graded</option>
            <option value="submitted">Pending</option>
            <option value="not_submitted">Not Submitted</option>
          </Select>
        </div>
      </Card>

      {/* Grades List */}
      <Card>
        {filteredAssignments.length === 0 ? (
          <div className="p-6">
            <Empty 
              icon="Award"
              title={searchTerm || filterSubject || filterStatus ? "No matching grades found" : "No grades available"}
              description={searchTerm || filterSubject || filterStatus ? "Try adjusting your search criteria" : "Complete assignments to see your grades here"}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.Id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500">{assignment.points} points</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{assignment.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {assignment.grade !== null ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {assignment.grade}/{assignment.points}
                          </div>
                          <div className="text-gray-500">
                            {Math.round((assignment.grade / assignment.points) * 100)}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(assignment.status, assignment.grade, assignment.points)}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.feedback ? (
                        <div className="text-sm text-gray-900 italic max-w-xs truncate" title={assignment.feedback}>
                          "{assignment.feedback}"
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Grades;