import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";
import { toast } from "react-toastify";

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useOutletContext();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssignmentDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    try {
      const assignmentData = await assignmentService.getById(id);
      setAssignment(assignmentData);

      if (currentRole === "student") {
        // Get student's submission
        const studentSubmission = await submissionService.getSubmission(id, 2);
        setSubmission(studentSubmission);
      } else {
        // Get all submissions for this assignment and student data
        const [submissionsData, studentsData] = await Promise.all([
          submissionService.getByAssignmentId(id),
          userService.getByRole("student")
        ]);
        setSubmissions(submissionsData);
        setStudents(studentsData);
      }
    } catch (err) {
      console.error("Error loading assignment details:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentDetails();
  }, [id, currentRole]);

  const handleDeleteAssignment = async () => {
    if (!assignment) return;
    
    if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    try {
      await assignmentService.delete(assignment.Id);
      toast.success("Assignment deleted successfully");
      navigate("/assignments");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  const handleSubmitAssignment = () => {
    navigate(`/assignments/${id}/submit`);
  };

  const handleEditAssignment = () => {
    navigate(`/assignments/${id}/edit`);
  };

  const handleGradeSubmission = (submissionId) => {
    navigate(`/submissions/${submissionId}/grade`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadAssignmentDetails} />;
  if (!assignment) return <ErrorView error="Assignment not found" />;

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isDueSoon = isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 3));
  const isPastDue = isBefore(dueDate, now);

  const getStatusBadge = () => {
    if (currentRole === "student") {
      if (!submission) {
        if (isPastDue) return <Badge variant="danger">Past Due</Badge>;
        if (isDueSoon) return <Badge variant="warning">Due Soon</Badge>;
        return <Badge variant="info">Not Submitted</Badge>;
      }
      
      switch (submission.status) {
        case "graded":
          return <Badge variant="success">Graded</Badge>;
        case "submitted":
          return <Badge variant="primary">Submitted</Badge>;
        default:
          return <Badge variant="info">Draft</Badge>;
      }
    }
    
    return <Badge variant="primary">{assignment.status}</Badge>;
  };

  const renderTeacherView = () => (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-lg text-gray-600">{assignment.subject}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleEditAssignment}>
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" onClick={handleDeleteAssignment} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Calendar" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm">{format(dueDate, "PPP 'at' p")}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Target" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Points</p>
                <p className="text-sm">{assignment.points} points</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Users" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Submissions</p>
                <p className="text-sm">{submissions.length} received</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Clock" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm capitalize">{assignment.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{assignment.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Student Submissions</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{submissions.filter(s => s.status === "submitted").length} pending review</span>
              <span>{submissions.filter(s => s.status === "graded").length} graded</span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Inbox" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No submissions received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map(sub => {
                const student = students.find(s => s.Id === sub.studentId);
                return (
                  <div key={sub.Id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {student?.name.split(" ").map(n => n[0]).join("") || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student?.name || "Unknown Student"}</p>
                          <p className="text-sm text-gray-600">
                            Submitted {format(new Date(sub.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {sub.status === "graded" ? (
                          <Badge variant="success">
                            {sub.grade}/{assignment.points} ({Math.round((sub.grade / assignment.points) * 100)}%)
                          </Badge>
                        ) : (
                          <Badge variant="warning">Pending Review</Badge>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant={sub.status === "submitted" ? "primary" : "outline"}
                          onClick={() => handleGradeSubmission(sub.Id)}
                        >
                          <ApperIcon name={sub.status === "submitted" ? "Award" : "Eye"} className="h-4 w-4 mr-1" />
                          {sub.status === "submitted" ? "Grade" : "View"}
                        </Button>
                      </div>
                    </div>
                    
                    {sub.attachments && sub.attachments.length > 0 && (
                      <div className="mt-3 flex items-center text-sm text-gray-600">
                        <ApperIcon name="Paperclip" className="h-4 w-4 mr-1" />
                        <span>{sub.attachments.length} attachment(s)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderStudentView = () => (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-lg text-gray-600">{assignment.subject}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {!submission && !isPastDue && (
                <Button variant="purple" onClick={handleSubmitAssignment}>
                  <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              )}
              {submission && submission.status !== "graded" && (
                <Button variant="outline" onClick={handleSubmitAssignment}>
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit Submission
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Calendar" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm">{format(dueDate, "PPP 'at' p")}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Target" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Points</p>
                <p className="text-sm">{assignment.points} points</p>
              </div>
            </div>

            {submission && submission.grade !== null && (
              <div className="flex items-center space-x-2 text-gray-600">
                <ApperIcon name="Award" className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Your Grade</p>
                  <p className="text-sm font-bold text-primary-600">
                    {submission.grade}/{assignment.points} ({Math.round((submission.grade / assignment.points) * 100)}%)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{assignment.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Submission Status */}
      {submission && (
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Submission</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Submitted Content:</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                </div>
              </div>

              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="space-y-2">
                    {submission.attachments.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
                        <ApperIcon name="FileText" className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <ApperIcon name="Clock" className="h-4 w-4 mr-1" />
                <span>Submitted on {format(new Date(submission.submittedAt), "PPP 'at' p")}</span>
              </div>

              {submission.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Teacher Feedback:</p>
                  <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
                    <p className="text-gray-700 italic">"{submission.feedback}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/assignments")} className="mr-4">
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
      </div>
      
      {currentRole === "teacher" ? renderTeacherView() : renderStudentView()}
    </div>
  );
};

export default AssignmentDetail;