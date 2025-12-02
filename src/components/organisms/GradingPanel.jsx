import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import submissionService from "@/services/api/submissionService";

const GradingPanel = ({ assignment, submission, student, onGradeSubmitted, onClose }) => {
  const [gradeData, setGradeData] = useState({
    grade: submission.grade || "",
    feedback: submission.feedback || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!gradeData.grade || parseInt(gradeData.grade) < 0 || parseInt(gradeData.grade) > assignment.points) {
      newErrors.grade = `Grade must be between 0 and ${assignment.points}`;
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
      await submissionService.grade(
        submission.Id, 
        parseInt(gradeData.grade), 
        gradeData.feedback
      );
      
      toast.success("Grade submitted successfully!");
      onGradeSubmitted?.();
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to submit grade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = () => {
    if (!gradeData.grade) return "gray";
    const percentage = (parseInt(gradeData.grade) / assignment.points) * 100;
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6">
      {/* Assignment & Student Info */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
              <p className="text-gray-600">{assignment.subject}</p>
            </div>
            <Badge variant="primary">{assignment.points} points</Badge>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center mr-3">
                <span className="text-white font-medium text-sm">
                  {student.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
              Submitted {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>
      </Card>

      {/* Submission Content */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="FileText" className="h-5 w-5 mr-2" />
            Student Submission
          </h3>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
          </div>

          {submission.attachments && submission.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Attachments:</p>
              {submission.attachments.map((file, index) => (
                <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
                  <ApperIcon name="FileText" className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Grading Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
              <ApperIcon name="Award" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
              <p className="text-gray-600">Provide a score and feedback for this student</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={`Grade (out of ${assignment.points} points)`}
                type="number"
                value={gradeData.grade}
                onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                error={errors.grade}
                min="0"
                max={assignment.points}
                placeholder={`Enter grade (0-${assignment.points})`}
              />

              <div className="flex items-end">
                {gradeData.grade && (
                  <div className="p-3 rounded-lg bg-gray-50 w-full">
                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                    <div className={`text-2xl font-bold`}>
                      <Badge variant={getGradeColor()}>
                        {Math.round((parseInt(gradeData.grade) / assignment.points) * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <FormField
              label="Feedback (Optional)"
              type="textarea"
              value={gradeData.feedback}
              onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Provide constructive feedback for the student..."
              className="min-h-[100px]"
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                variant="success"
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                    Submit Grade
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

export default GradingPanel;