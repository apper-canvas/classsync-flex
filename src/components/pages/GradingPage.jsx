import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import Button from "@/components/atoms/Button";
import GradingPanel from "@/components/organisms/GradingPanel";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";

const GradingPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useOutletContext();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentRole !== "teacher") {
      navigate("/assignments");
      return;
    }

    loadGradingData();
  }, [submissionId, currentRole]);

  const loadGradingData = async () => {
    if (!submissionId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const submissionData = await submissionService.getById(submissionId);
      setSubmission(submissionData);

      const [assignmentData, studentData] = await Promise.all([
        assignmentService.getById(submissionData.assignmentId),
        userService.getById(submissionData.studentId)
      ]);
      
      setAssignment(assignmentData);
      setStudent(studentData);
    } catch (err) {
      console.error("Error loading grading data:", err);
      setError("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmitted = () => {
    if (assignment) {
      navigate(`/assignments/${assignment.Id}`);
    } else {
      navigate("/assignments");
    }
  };

  const handleClose = () => {
    if (assignment) {
      navigate(`/assignments/${assignment.Id}`);
    } else {
      navigate("/assignments");
    }
  };

  if (currentRole !== "teacher") {
    return <ErrorView error="Access denied. Only teachers can grade submissions." />;
  }

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadGradingData} />;
  if (!assignment || !submission || !student) {
    return <ErrorView error="Submission details not found" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleClose} className="mr-4">
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Assignment
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
          <p className="text-gray-600">Review and grade {student.name}'s work</p>
        </div>
      </div>

      <GradingPanel
        assignment={assignment}
        submission={submission}
        student={student}
        onGradeSubmitted={handleGradeSubmitted}
        onClose={handleClose}
      />
    </div>
  );
};

export default GradingPage;