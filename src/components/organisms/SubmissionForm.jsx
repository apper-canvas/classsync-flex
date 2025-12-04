import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FileUpload } from "@/components/atoms/FileUpload";
import { FilePreview } from "@/components/molecules/FilePreview";
import { toast } from "react-toastify";
import submissionService from "@/services/api/submissionService";
import ApperIcon from "@/components/ApperIcon";
import Textarea from "@/components/atoms/Textarea";
import Label from "@/components/atoms/Label";
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
  
const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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

const handleFilesChange = (uploadedFiles) => {
    // Convert FileUpload format to submission format
    const submissionFiles = uploadedFiles.map(fileObj => ({
      id: fileObj.id,
      name: fileObj.name,
      size: fileObj.size,
      type: fileObj.type,
      status: 'completed',
      file: fileObj.file // Store original file reference
    }));
    
    setFormData(prev => ({
      ...prev,
      files: submissionFiles
    }));
    
    // Clear file-related errors
    if (errors.content && submissionFiles.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const handleFileRemove = (fileId) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
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
        isDraft: true,
        status: 'draft'
      };

      let savedSubmission;
      if (existingSubmission && existingSubmission.Id) {
        savedSubmission = await submissionService.update(existingSubmission.Id, submissionData);
      } else {
        savedSubmission = await submissionService.create(submissionData);
      }

      setLastSaved(new Date());
      toast.success("Draft saved successfully!");
      
      // Update URL if this was a new submission
      if (!existingSubmission && savedSubmission) {
        navigate(`/assignments/${assignment.Id}/submissions/${savedSubmission.Id}/edit`, { replace: true });
      }
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
        status: 'submitted',
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
    if (link && link.trim()) {
      // Basic URL validation
      try {
        new URL(link.trim());
        setFormData(prev => ({
          ...prev,
          links: [...prev.links, link.trim()]
        }));
        toast.success("Link added successfully!");
        
        // Clear content errors if we now have links
        if (errors.content) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.content;
            return newErrors;
          });
        }
      } catch {
        toast.error("Please enter a valid URL");
      }
    }
  };

const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

const handleConfirmSubmit = () => {
    confirmSubmit();
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Eye" size={16} />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
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

            {/* File Upload Section */}
            <FormField
              label="File Attachments"
              type="custom"
              description="Upload documents, images, or other relevant files"
            >
              <FileUpload
                onFilesChange={handleFilesChange}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                  'text/plain': ['.txt'],
                  'application/zip': ['.zip']
                }}
                maxSize={10485760} // 10MB
                maxFiles={5}
                className="w-full"
              />
            </FormField>

{/* Links Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>External Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Add Link
                </Button>
              </div>
              
              {formData.links.length > 0 && (
                <div className="space-y-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <ApperIcon name="Link" size={16} className="text-blue-600 flex-shrink-0" />
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate flex-1 text-sm"
                      >
                        {link}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(index)}
                        className="flex-shrink-0 text-gray-500 hover:text-red-600"
                      >
                        <ApperIcon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Previews */}
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
{!showPreview && (
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <ApperIcon name="Loader2" className="animate-spin mr-2" size={16} />
                      {existingSubmission && !existingSubmission.isDraft ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    existingSubmission && !existingSubmission.isDraft ? 'Update Submission' : 'Submit Assignment'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" size={16} />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Preview Mode */}
            {showPreview && (
              <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Submission Preview</h3>
                  <Button variant="outline" onClick={togglePreview}>
                    <ApperIcon name="Edit" size={16} className="mr-2" />
                    Edit
                  </Button>
                </div>
                
                {formData.content && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    <div className="p-4 bg-white rounded-lg border whitespace-pre-wrap">
                      {formData.content}
                    </div>
                  </div>
                )}
                
                {formData.files.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Files ({formData.files.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.files.map(file => (
                        <FilePreview key={file.id} file={file} />
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.links.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Links ({formData.links.length})</h4>
                    <div className="space-y-2">
                      {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <ApperIcon name="Link" size={16} className="text-blue-600" />
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate">
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.comments && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                    <div className="p-4 bg-white rounded-lg border whitespace-pre-wrap">
                      {formData.comments}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={Object.keys(validateForm()).length > 0}
                    className="flex-1"
                  >
                    <ApperIcon name="Send" size={16} className="mr-2" />
                    {existingSubmission && !existingSubmission.isDraft ? 'Update Submission' : 'Submit Assignment'}
                  </Button>
<Button variant="outline" onClick={handleSaveAsDraft} disabled={saving}>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    Save Draft
                  </Button>
                </div>
              </div>
)}
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
              
<div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  {loading ? (
                    <>
                      <ApperIcon name="Loader2" className="animate-spin mr-2" size={16} />
                      Submitting...
                    </>
                  ) : (
                    'Yes, Submit'
                  )}
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