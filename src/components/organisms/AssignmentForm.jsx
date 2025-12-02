import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import classService from "@/services/api/classService";
const AssignmentForm = ({ assignment, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    dueDate: assignment?.dueDate ? assignment.dueDate.split("T")[0] : "",
    points: assignment?.points || "",
    subject: assignment?.subject || ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const classes = await classService.getAll();
      
      // Extract unique subjects from classes
      const uniqueSubjects = [...new Set(classes.map(cls => cls.subject).filter(Boolean))];
      setSubjects(uniqueSubjects.sort());
    } catch (error) {
      console.error("Error loading subjects:", error);
      // Fallback to default subjects if loading fails
      setSubjects([
        "Mathematics",
        "English Literature", 
        "History",
        "Science",
        "Chemistry",
        "Physics",
        "Biology",
        "Computer Science",
        "Art",
        "Music"
      ]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }
    
    if (!formData.points || parseInt(formData.points) <= 0) {
      newErrors.points = "Points must be a positive number";
    }
    
    if (!formData.subject) {
      newErrors.subject = "Subject is required";
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
      const assignmentData = {
        ...formData,
        points: parseInt(formData.points),
        dueDate: new Date(formData.dueDate + "T23:59:00Z").toISOString(),
        teacherId: 1 // Mock teacher ID
      };

      if (assignment) {
        await assignmentService.update(assignment.Id, assignmentData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentService.create(assignmentData);
        toast.success("Assignment created successfully!");
      }
      
      onSave?.();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error("Failed to save assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
            <ApperIcon name={assignment ? "Edit" : "Plus"} className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {assignment ? "Edit Assignment" : "Create New Assignment"}
            </h2>
            <p className="text-gray-600">
              {assignment ? "Update assignment details" : "Fill in the details for your new assignment"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Assignment Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            placeholder="Enter assignment title"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={errors.description}
            placeholder="Provide detailed instructions for the assignment"
            className="min-h-[120px]"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              error={errors.dueDate}
            />

            <FormField
              label="Points"
              type="number"
              value={formData.points}
              onChange={(e) => handleChange("points", e.target.value)}
              error={errors.points}
              placeholder="100"
              min="1"
            />

<FormField
              label="Subject"
              type="select"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              error={errors.subject}
              placeholder="Select a subject"
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </FormField>
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
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name={assignment ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                  {assignment ? "Update" : "Create"} Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default AssignmentForm;