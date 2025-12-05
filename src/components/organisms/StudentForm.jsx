import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import userService from "@/services/api/userService";

const StudentForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
firstName: student?.name?.split(" ")[0] || "",
    lastName: student?.name?.split(" ").slice(1).join(" ") || "",
    email: student?.email || "",
    studentId: student?.studentId || "",
    gradeLevel: student?.gradeLevel || "",
    classesEnrolled: student?.classesEnrolled || [],
    overallGPA: student?.overallGPA?.toString() || "",
    currentStatus: student?.currentStatus || "Active"
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    }

    if (!formData.gradeLevel) {
      newErrors.gradeLevel = "Grade level is required";
    }

    if (formData.overallGPA && (isNaN(formData.overallGPA) || formData.overallGPA < 0 || formData.overallGPA > 4)) {
      newErrors.overallGPA = "GPA must be a number between 0 and 4";
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
      const studentData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        role: "student",
        classesEnrolled: formData.classesEnrolled,
        overallGPA: formData.overallGPA ? parseFloat(formData.overallGPA) : 0.0,
        enrollmentDate: student?.enrollmentDate || new Date().toISOString()
      };

      await userService.create(studentData);
      toast.success("Student added successfully!");
      onSave?.();
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error("Failed to add student. Please try again.");
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

  const handleClassesChange = (classString) => {
    const classes = classString.split(',').map(c => c.trim()).filter(c => c.length > 0);
    setFormData(prev => ({ ...prev, classesEnrolled: classes }));
    if (errors.classesEnrolled) {
      setErrors(prev => ({ ...prev, classesEnrolled: "" }));
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
            <ApperIcon name="UserPlus" className="h-5 w-5 text-white" />
          </div>
<div>
            <h2 className="text-xl font-bold text-gray-900">
              {student ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-gray-600">
              Fill in the student details to add them to your class
            </p>
          </div>
        </div>

<form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              error={errors.firstName}
              placeholder="Enter first name"
            />

            <FormField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              error={errors.lastName}
              placeholder="Enter last name"
            />
          </div>

          <FormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            placeholder="student@example.com"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Student ID"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              error={errors.studentId}
              placeholder="Enter student ID"
            />

            <FormField
              label="Grade Level"
              type="select"
              value={formData.gradeLevel}
              onChange={(e) => handleChange("gradeLevel", e.target.value)}
              error={errors.gradeLevel}
              placeholder="Select grade level"
            >
              <option value="">Select grade level</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </FormField>
          </div>

          <FormField
            label="Classes Enrolled"
            value={formData.classesEnrolled.join(', ')}
            onChange={(e) => handleClassesChange(e.target.value)}
            error={errors.classesEnrolled}
            placeholder="Mathematics, Science, History (comma separated)"
            helperText="Enter class names separated by commas"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Overall GPA"
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={formData.overallGPA}
              onChange={(e) => handleChange("overallGPA", e.target.value)}
              error={errors.overallGPA}
              placeholder="0.0"
            />

            <FormField
              label="Current Status"
              type="select"
              value={formData.currentStatus}
              onChange={(e) => handleChange("currentStatus", e.target.value)}
              error={errors.currentStatus}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
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
                  Adding...
                </>
) : (
                <>
                  <ApperIcon name={student ? "Save" : "UserPlus"} className="h-4 w-4 mr-2" />
                  {student ? 'Update Student' : 'Add Student'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default StudentForm;