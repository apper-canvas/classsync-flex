import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import Button from "@/components/atoms/Button";
import AssignmentForm from "@/components/organisms/AssignmentForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";

const AssignmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useOutletContext();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(id);

  useEffect(() => {
    if (currentRole !== "teacher") {
      navigate("/assignments");
      return;
    }

    if (isEditing) {
      loadAssignment();
    }
  }, [id, currentRole]);

  const loadAssignment = async () => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    try {
      const assignmentData = await assignmentService.getById(id);
      setAssignment(assignmentData);
    } catch (err) {
      console.error("Error loading assignment:", err);
      setError("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    navigate("/assignments");
  };

  const handleCancel = () => {
    navigate(isEditing ? `/assignments/${id}` : "/assignments");
  };

  if (currentRole !== "teacher") {
    return <ErrorView error="Access denied. Only teachers can create/edit assignments." />;
  }

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadAssignment} />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mr-4">
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Assignment" : "Create New Assignment"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Update assignment details" : "Fill in the details for your new assignment"}
          </p>
        </div>
      </div>

      <AssignmentForm
        assignment={assignment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AssignmentFormPage;