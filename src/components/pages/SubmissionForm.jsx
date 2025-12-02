import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import Button from "@/components/atoms/Button";
import SubmissionForm from "@/components/organisms/SubmissionForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
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

  const studentId = 2; // Mock student ID

  useEffect(() => {
    if (currentRole !== "student") {
      navigate("/assignments");
      return;
    }

    loadData();
  }, [id, currentRole]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    try {
      const [assignmentData, existingSubmission] = await Promise.all([
        assignmentService.getById(id),
        submissionService.getSubmission(id, studentId)
      ]);
      
      setAssignment(assignmentData);
      setSubmission(existingSubmission);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    navigate(`/assignments/${id}`);
  };

  const handleCancel = () => {
    navigate(`/assignments/${id}`);
  };

  if (currentRole !== "student") {
    return <ErrorView error="Access denied. Only students can submit assignments." />;
  }

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;
  if (!assignment) return <ErrorView error="Assignment not found" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mr-4">
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Assignment
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {submission ? "Edit Submission" : "Submit Assignment"}
          </h1>
          <p className="text-gray-600">
            {submission ? "Update your submission" : "Submit your work for this assignment"}
          </p>
        </div>
      </div>

      <SubmissionForm
        assignment={assignment}
        existingSubmission={submission}
        studentId={studentId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default SubmissionFormPage;