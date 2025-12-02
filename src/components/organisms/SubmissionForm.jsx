import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import submissionService from "@/services/api/submissionService";

const SubmissionForm = ({ assignment, existingSubmission, studentId = 2, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    content: existingSubmission?.content || "",
    attachments: existingSubmission?.attachments || []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.content.trim()) {
      newErrors.content = "Submission content is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submissionData = {
        assignmentId: assignment.Id,
        studentId: studentId,
        content: formData.content,
        attachments: formData.attachments
      };

      if (existingSubmission) {
        await submissionService.update(existingSubmission.Id, submissionData);
        toast.success("Submission updated successfully!");
      } else {
        await submissionService.create(submissionData);
        toast.success("Assignment submitted successfully!");
      }
      
      onSubmit?.();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileAttach = () => {
    // Simulate file attachment
    const fileName = `submission_${Date.now()}.pdf`;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, fileName]
    }));
    toast.success("File attached successfully!");
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = new Date() > dueDate;

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
              <p className="text-gray-600">{assignment.subject}</p>
            </div>
            <Badge variant={isOverdue ? "danger" : "info"}>
              {assignment.points} points
            </Badge>
          </div>
          
          <p className="text-gray-700">{assignment.description}</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
              Due {format(dueDate, "MMM d, yyyy 'at' h:mm a")}
            </div>
            {isOverdue && (
              <Badge variant="danger">
                <ApperIcon name="AlertCircle" className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Submission Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <ApperIcon name={existingSubmission ? "Edit" : "Upload"} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {existingSubmission ? "Edit Submission" : "Submit Assignment"}
              </h3>
              <p className="text-gray-600">
                {existingSubmission ? "Update your submission" : "Provide your work and any supporting files"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Your Work"
              type="textarea"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              error={errors.content}
              placeholder="Paste your work here or describe what you've attached..."
              className="min-h-[150px]"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleFileAttach}
                  disabled={loading}
                >
                  <ApperIcon name="Paperclip" className="h-4 w-4 mr-1" />
                  Attach File
                </Button>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <ApperIcon name="FileText" className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <ApperIcon name="X" className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                variant="purple"
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                    {existingSubmission ? "Update" : "Submit"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SubmissionForm;