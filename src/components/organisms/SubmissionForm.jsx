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
    attachments: existingSubmission?.attachments || [],
    links: existingSubmission?.links || [],
    comments: existingSubmission?.comments || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.content.trim() && formData.attachments.length === 0 && formData.links.length === 0) {
      newErrors.content = "Please provide written work, attach files, or share links";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    try {
      const submissionData = {
        assignmentId: assignment.Id,
        studentId: studentId,
        content: formData.content,
        attachments: formData.attachments,
        links: formData.links,
        comments: formData.comments,
        status: "draft"
      };

      if (existingSubmission) {
        await submissionService.update(existingSubmission.Id, submissionData);
      } else {
        await submissionService.create(submissionData);
      }
      
      setLastSaved(new Date());
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    
    try {
      const submissionData = {
        assignmentId: assignment.Id,
        studentId: studentId,
        content: formData.content,
        attachments: formData.attachments,
        links: formData.links,
        comments: formData.comments,
        status: "submitted"
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
    const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png', 'zip'];
    const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileName = `submission_${Date.now()}.${randomType}`;
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, fileName]
    }));
    toast.success("File attached successfully!");
  };

  const addLink = () => {
    const link = prompt("Enter URL (Google Drive, Docs, or external link):");
    if (link) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
      toast.success("Link added successfully!");
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
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
          
          <div className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </div>
          
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
          <div className="flex items-center justify-between">
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
            
            {lastSaved && (
              <div className="text-xs text-gray-500">
                <ApperIcon name="Check" className="h-3 w-3 inline mr-1" />
                Draft saved at {format(lastSaved, "h:mm a")}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Submission */}
            <div className="space-y-3">
              <FormField
                label="Written Response"
                type="textarea"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                error={errors.content}
                placeholder="Type your response here... You can use formatting like **bold**, *italic*, and create lists."
                className="min-h-[200px] font-mono"
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  File Uploads
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleFileAttach}
                  disabled={loading}
                >
                  <ApperIcon name="Upload" className="h-4 w-4 mr-1" />
                  Upload File
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <ApperIcon name="Upload" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop files here or <span className="text-purple-600 font-medium">browse to upload</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: PDF, DOCX, XLSX, PPTX, Images, ZIP (Max 50MB per file)
                </p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <ApperIcon name="FileText" className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                        <span className="text-xs text-gray-500 ml-2">(2.3 MB)</span>
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

            {/* Link Submission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Share Links
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addLink}
                  disabled={loading}
                >
                  <ApperIcon name="Link" className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>

              {formData.links.length > 0 && (
                <div className="space-y-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <ApperIcon name="ExternalLink" className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm text-blue-700 truncate">{link}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeLink(index)}
                      >
                        <ApperIcon name="X" className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <FormField
              label="Additional Comments (Optional)"
              type="textarea"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Add any additional notes or comments for your teacher..."
              className="min-h-[80px]"
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading || saving}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={loading || saving}
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || saving}
                variant="primary"
                className="min-w-[140px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <div className="space-y-4">
              <div className="text-center">
                <ApperIcon name="AlertTriangle" className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Submit Assignment?</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to submit this assignment? You can edit it later if resubmission is allowed.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="confirm" 
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                />
                <label htmlFor="confirm" className="text-sm text-gray-700">
                  I confirm this is my final submission
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmSubmit}
                  className="bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  Yes, Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;