import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import SubmissionForm from "@/components/organisms/SubmissionForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";

const SubmissionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useOutletContext();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [assignmentData, submissionData] = await Promise.all([
        assignmentService.getById(id),
        submissionService.getSubmission(id, 2) // Student ID 2
      ]);
      
      setAssignment(assignmentData);
      setSubmission(submissionData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmit = () => {
    navigate(`/assignments/${id}`);
  };

  const handleCancel = () => {
    navigate(`/assignments/${id}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;
  if (!assignment) return <ErrorView error="Assignment not found" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/assignments/${id}`)}
          className="p-2"
        >
          <ApperIcon name="ArrowLeft" className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Assignment</h1>
          <p className="text-gray-600">{assignment.title}</p>
        </div>
      </div>

      {/* Submission Form */}
      <SubmissionForm
        assignment={assignment}
        existingSubmission={submission}
        studentId={2}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default SubmissionFormPage;