import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FileUpload } from "@/components/atoms/FileUpload";
import { FilePreview } from "@/components/molecules/FilePreview";
import { toast } from "react-toastify";
import submissionService from "@/services/api/submissionService";
import ApperIcon from "@/components/ApperIcon";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";

const SubmissionForm = ({ assignment, existingSubmission, studentId = 2, onSubmit, onCancel }) => {
  const { submissionId, assignmentId } = useParams();
  const navigate = useNavigate();
  
const [formData, setFormData] = useState({
    content: existingSubmission?.content || "",
    files: existingSubmission?.files || [],
    links: existingSubmission?.links || [],
    comments: existingSubmission?.comments || ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadSubmission = async () => {
if (submissionId) {
        try {
          const submission = await submissionService.getById(parseInt(submissionId));
          if (submission) {
            setFormData({
              content: submission.content || "",
              files: submission.files || [],
              links: submission.links || [],
              comments: submission.comments || ""
            });
          }
        } catch (error) {
          console.error("Error loading submission:", error);
          toast.error("Failed to load submission");
        }
      }
    };

    loadSubmission();
  }, [submissionId]);

  const validateForm = () => {
    const newErrors = {};
    
if (!formData.content.trim() && formData.files.length === 0 && formData.links.length === 0) {
      newErrors.content = "Please provide content, upload files, or add links for your submission";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleFileAttach = () => {
    const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png', 'zip'];
    const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileName = `submission_${Date.now()}.${randomType}`;
    const newFile = {
      id: Date.now(),
      name: fileName,
      size: Math.floor(Math.random() * 1000000) + 100000,
      type: `application/${randomType}`,
      status: 'completed'
    };
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
    toast.success("File attached successfully!");
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    try {
const submissionData = {
        assignmentId: assignment.Id,
        studentId: studentId,
        content: formData.content,
        files: formData.files,
        links: formData.links,
        comments: formData.comments,
        isDraft: true
      };

      if (existingSubmission) {
        await submissionService.update(existingSubmission.id, submissionData);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesChange = (files) => {
    setFormData(prev => ({
      ...prev,
      files: files || []
    }));
  };

  const handleFileRemove = (fileId) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
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
        files: formData.files,
        links: formData.links,
        comments: formData.comments,
        isDraft: false,
        submittedAt: new Date().toISOString()
      };

      if (existingSubmission) {
        await submissionService.update(existingSubmission.id, submissionData);
        toast.success("Submission updated successfully!");
      } else {
        await submissionService.create(submissionData);
        toast.success("Assignment submitted successfully!");
      }

      if (onSubmit) {
        onSubmit(submissionData);
      } else {
        navigate('/submissions');
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setLoading(false);
    }
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

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
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
            {/* Content Field */}
            <FormField label="Content" required>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter your submission content..."
                rows={6}
                required
              />
            </FormField>

            {/* File Upload */}
            <FormField label="Files" description="Upload supporting files for your submission">
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={5}
                maxSize={10485760} // 10MB
                disabled={loading}
              />
            </FormField>

            {formData.files && formData.files.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">File Previews</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.files.map(file => (
                    <FilePreview
                      key={file.id}
                      file={file}
                      onRemove={handleFileRemove}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="animate-spin mr-2" size={16} />
                    {submissionId ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  submissionId ? 'Update Submission' : 'Submit Assignment'
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