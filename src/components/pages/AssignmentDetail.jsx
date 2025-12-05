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

  const getAssignmentTypeIcon = (type) => {
    const iconMap = {
      'Homework': 'BookOpen',
      'Quiz': 'HelpCircle', 
      'Project': 'FolderOpen',
      'Lab': 'Flask',
      'Essay': 'PenTool'
    };
    return iconMap[type] || 'FileText';
  };

  const getTimeUntilDue = () => {
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (isPastDue) {
      const daysOverdue = Math.abs(daysDiff);
      return `Past due by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
    } else if (daysDiff === 0) {
      return "Due today";
    } else if (daysDiff === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
    }
  };
const getStatusBadge = () => {
    if (currentRole === "student") {
      if (!submission) {
        if (isPastDue) return <Badge variant="danger">Past Due - Not Submitted</Badge>;
        return <Badge variant="secondary">Not Started</Badge>;
      }
      
      switch (submission.status) {
        case "graded":
          return <Badge variant="primary">Graded</Badge>;
        case "submitted":
          return <Badge variant="success">Submitted</Badge>;
        case "draft":
          return <Badge variant="warning">In Progress</Badge>;
        default:
          return <Badge variant="secondary">Not Started</Badge>;
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
              <div className="flex items-center space-x-3">
                <ApperIcon name={getAssignmentTypeIcon(assignment.assignmentType)} className="h-8 w-8 text-purple-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                  <p className="text-lg text-gray-600">{assignment.subject} • {assignment.assignmentType}</p>
                </div>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <ApperIcon name="Plus" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm">{format(new Date(assignment.createdDate), "MMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Clock" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Last Modified</p>
                <p className="text-sm">{format(new Date(assignment.lastModifiedDate), "MMM d, yyyy")}</p>
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
              <div className="flex items-center space-x-3">
                <ApperIcon name={getAssignmentTypeIcon(assignment.assignmentType)} className="h-8 w-8 text-purple-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                  <p className="text-lg text-gray-600">{assignment.subject} • {assignment.assignmentType}</p>
                </div>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <ApperIcon name="Calendar" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm">{format(dueDate, "PPP 'at' p")}</p>
                <p className={`text-xs font-medium ${isPastDue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                  {getTimeUntilDue()}
                </p>
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
              <ApperIcon name="Plus" className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm">{format(new Date(assignment.createdDate), "MMM d, yyyy")}</p>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment Instructions</h3>
            <div className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{assignment.description}</p>
            </div>
            
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Resources & Materials:</p>
                <div className="space-y-2">
                  {assignment.attachments.map((file, index) => (
                    <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <ApperIcon name="Download" className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-700">{file}</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ApperIcon name="ExternalLink" className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignment.rubric && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Grading Rubric:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">{assignment.rubric}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Submission Status */}
{/* Submission Section for Students */}
      {currentRole === "student" && !submission && !isPastDue && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <ApperIcon name="Upload" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Submit Your Work</h2>
                <p className="text-gray-600">Upload files, write your response, or share links</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer">
                <ApperIcon name="Upload" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">File Upload</p>
                <p className="text-xs text-gray-500">PDF, DOCX, Images (Max 50MB)</p>
              </div>
              
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer">
                <ApperIcon name="Type" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Text Response</p>
                <p className="text-xs text-gray-500">Type your answer directly</p>
              </div>
              
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer">
                <ApperIcon name="Link" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Share Link</p>
                <p className="text-xs text-gray-500">Google Docs, Drive, URLs</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleSubmitAssignment}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3"
              >
                <ApperIcon name="Play" className="h-5 w-5 mr-2" />
                Start Assignment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Submission Display */}
      {submission && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Submission</h2>
              {submission.status === "draft" && (
                <Badge variant="warning">Draft - Not Submitted</Badge>
              )}
              {submission.status === "submitted" && (
                <Badge variant="success">Successfully Submitted</Badge>
              )}
              {submission.status === "graded" && submission.grade && (
                <Badge variant="primary">{submission.grade}/{assignment.points} pts</Badge>
              )}
            </div>
            
            <div className="space-y-4">
              {submission.content && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Written Response:</p>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>
              )}

              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</p>
                  <div className="space-y-2">
                    {submission.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <ApperIcon name="FileText" className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Download" className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.links && submission.links.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Shared Links:</p>
                  <div className="space-y-2">
                    {submission.links.map((link, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <ApperIcon name="ExternalLink" className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm text-blue-700">{link}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.submittedAt && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Clock" className="h-4 w-4 mr-1" />
                    <span>
                      {submission.status === "draft" 
                        ? `Last saved on ${format(new Date(submission.submittedAt), "PPP 'at' p")}` 
                        : `Submitted on ${format(new Date(submission.submittedAt), "PPP 'at' p")}`
                      }
                    </span>
                  </div>
                  {submission.status === "submitted" && !isPastDue && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSubmitAssignment}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit Submission
                    </Button>
                  )}
                </div>
              )}

              {submission.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Teacher Feedback:</p>
                  <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">"{submission.feedback}"</p>
                  </div>
                </div>
              )}

              {submission.status === "graded" && submission.grade && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Final Grade</p>
                      <p className="text-2xl font-bold text-green-900">{submission.grade} / {assignment.points}</p>
                      <p className="text-sm text-green-700">
                        {((submission.grade / assignment.points) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <ApperIcon name="Award" className="h-12 w-12 text-green-600" />
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