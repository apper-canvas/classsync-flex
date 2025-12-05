import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import AssignmentCard from "@/components/molecules/AssignmentCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";
import { toast } from "react-toastify";

const Assignments = () => {
  const { currentRole } = useOutletContext();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");

const loadAssignments = async () => {
    setLoading(true);
    setError("");
    console.log("Loading assignments...");
    
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentService.getActiveAssignments(),
        submissionService.getAll()
      ]);
      
      console.log("Loaded assignments:", assignmentsData);
      console.log("Assignment subjects:", assignmentsData.map(a => a.subject));
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const getFilteredAndSortedAssignments = () => {
    let filtered = assignments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }

    // Sort assignments
filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "subject":
          return a.subject.localeCompare(b.subject);
        case "points":
          return b.points - a.points;
        case "assignmentType":
          return a.assignmentType.localeCompare(b.assignmentType);
        case "createdDate":
          return new Date(b.createdDate) - new Date(a.createdDate);
        case "dueDate":
        default:
          return new Date(a.dueDate) - new Date(b.dueDate);
      }
    });

    return filtered;
  };

  const getSubmissionForAssignment = (assignmentId) => {
    if (currentRole === "student") {
      return submissions.find(s => s.assignmentId === assignmentId && s.studentId === 2);
    }
    return null;
  };

  const handleDeleteAssignment = async (assignment) => {
    if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    try {
      await assignmentService.delete(assignment.Id);
      setAssignments(prev => prev.filter(a => a.Id !== assignment.Id));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  const handleViewAssignment = (assignment) => {
    navigate(`/assignments/${assignment.Id}`);
  };

  const handleEditAssignment = (assignment) => {
    navigate(`/assignments/${assignment.Id}/edit`);
  };

const handleSubmitAssignment = (assignment) => {
    toast.info(`Opening submission form for "${assignment.title}"`);
    navigate(`/assignments/${assignment.Id}/submit`);
  };

const getUniqueSubjects = () => {
    const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))].sort();
    console.log("Unique subjects:", subjects);
    return subjects;
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadAssignments} />;

  const filteredAssignments = getFilteredAndSortedAssignments();
  const subjects = getUniqueSubjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {currentRole === "teacher" ? "Manage Assignments" : "My Assignments"}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentRole === "teacher" 
              ? "Create and manage assignments for your students" 
              : "View and submit your assignments"}
          </p>
        </div>

        {currentRole === "teacher" && (
          <Button onClick={() => navigate("/assignments/new")}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-card">
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
value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="title">Sort by Title</option>
          <option value="subject">Sort by Subject</option>
          <option value="points">Sort by Points</option>
          <option value="assignmentType">Sort by Type</option>
          <option value="createdDate">Sort by Created Date</option>
        </Select>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <Empty 
          icon={currentRole === "teacher" ? "FileText" : "BookOpen"}
          title={searchTerm || filterSubject ? "No matching assignments found" : "No assignments available"}
          description={
            searchTerm || filterSubject 
              ? "Try adjusting your search criteria"
              : currentRole === "teacher" 
                ? "Create your first assignment to get started" 
                : "Check back later for new assignments"
          }
          actionLabel={currentRole === "teacher" ? "Create Assignment" : undefined}
          onAction={currentRole === "teacher" ? () => navigate("/assignments/new") : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map(assignment => (
            <AssignmentCard
              key={assignment.Id}
              assignment={assignment}
              userRole={currentRole}
              submission={getSubmissionForAssignment(assignment.Id)}
              onView={handleViewAssignment}
              onEdit={handleEditAssignment}
              onDelete={handleDeleteAssignment}
              onSubmit={handleSubmitAssignment}
            />
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {filteredAssignments.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{filteredAssignments.length}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{subjects.length}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {filteredAssignments.reduce((sum, a) => sum + a.points, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {currentRole === "student" 
                  ? submissions.filter(s => s.studentId === 2 && s.status === "graded").length
                  : submissions.filter(s => s.status === "submitted").length}
              </div>
              <div className="text-sm text-gray-600">
                {currentRole === "student" ? "Graded" : "Pending Review"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;