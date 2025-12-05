import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import gradebookService from "@/services/api/gradebookService";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";
import assignmentService from "@/services/api/assignmentService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Assignments from "@/components/pages/Assignments";
import Students from "@/components/pages/Students";

const Grades = () => {
  const { currentRole } = useOutletContext();
  const [gradebookData, setGradebookData] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [expandedClasses, setExpandedClasses] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  useEffect(() => {
    if (currentRole === 'teacher') {
      loadGradebook();
    } else {
      loadStudentGrades();
    }
}, [currentRole]);

  const loadGradebook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gradebookService.getGradebookData();
      setGradebookData(data);
    } catch (err) {
      console.error('Error loading gradebook:', err);
      setError(err.message || 'Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      const grades = await gradebookService.getStudentGrades(user.Id);
      setStudentGrades(grades);
    } catch (err) {
      console.error('Error loading student grades:', err);
      setError(err.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const toggleClassExpansion = (teacherId) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(teacherId)) {
      newExpanded.delete(teacherId);
    } else {
      newExpanded.add(teacherId);
    }
    setExpandedClasses(newExpanded);
  };

  const handleCellClick = (studentId, assignmentId, currentGrade, maxPoints) => {
    setEditingCell({ studentId, assignmentId });
    setEditingValue(currentGrade !== null ? currentGrade.toString() : '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      const { studentId, assignmentId } = editingCell;
      const assignment = gradebookData.assignments.find(a => a.Id === assignmentId);
      
      if (editingValue === '') {
        // If empty, treat as no grade (null)
        setEditingCell(null);
        return;
      }

      const validatedGrade = gradebookService.validateGrade(editingValue, assignment.points);
      
      await gradebookService.updateGrade(studentId, assignmentId, validatedGrade);
      
      // Reload gradebook to get updated data
      await loadGradebook();
      
      toast.success('Grade updated successfully!');
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error(error.message || 'Failed to update grade');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return <ApperIcon name="CheckCircle" className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <ApperIcon name="Clock" className="h-4 w-4 text-amber-600" />;
      default:
        return <ApperIcon name="X" className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'graded':
        return 'Graded ✅';
      case 'pending':
        return 'Pending ⏳';
      default:
        return 'Missing ❌';
    }
};

  const renderGradeCell = (gradeData, student) => {
    const { assignmentId, grade, maxPoints } = gradeData;
    const isEditing = editingCell?.studentId === student.Id && editingCell?.assignmentId === assignmentId;
    const cellKey = `${student.Id}-${assignmentId}`;

    if (isEditing) {
      return (
        <td key={cellKey} className="p-2">
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyPress={handleKeyPress}
            className="w-16 h-8 text-center text-sm"
            placeholder="0"
            autoFocus
          />
        </td>
      );
    }

    const displayGrade = grade !== null ? grade : '-';
    const cellColors = gradebookService.getGradeCellColor(grade, maxPoints);
    const percentage = grade !== null ? Math.round((grade / maxPoints) * 100) : null;

    return (
      <td key={cellKey} className="p-1">
        <div
          className={`
            w-16 h-8 flex items-center justify-center text-sm font-medium cursor-pointer
            border rounded transition-all duration-150 hover:shadow-sm
            ${cellColors}
          `}
          onClick={() => handleCellClick(student.Id, assignmentId, grade, maxPoints)}
          title={`Click to edit grade${percentage !== null ? ` (${percentage}%)` : ''}`}
        >
          {displayGrade}
        </div>
      </td>
    );
  };

  const renderFinalGradeCell = (finalGrade) => {
    const colors = gradebookService.getGradeColor(finalGrade.percentage);
    
    return (
      <td className="p-2 border-l-2 border-gray-300">
        <div className={`px-3 py-2 rounded-lg text-center font-semibold ${colors}`}>
          <div className="text-lg">{finalGrade.letter}</div>
          <div className="text-xs">{finalGrade.percentage}%</div>
        </div>
      </td>
    );
  };

  // Render student view
  const renderStudentGrades = () => {
    if (!studentGrades || studentGrades.length === 0) {
      return (
        <Empty 
          icon="BookOpen" 
          title="No Grades Available"
          description="You are not enrolled in any classes or no assignments have been created yet."
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ApperIcon name="BookOpen" className="h-7 w-7 mr-3 text-primary-600" />
              My Grades
            </h1>
            <p className="text-gray-600 mt-1">
              View your academic progress across all classes
            </p>
          </div>
          <Button onClick={loadStudentGrades} variant="secondary" size="sm">
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

{/* Overall GPA Summary */}
        {(() => {
          const overallGPA = gradebookService.calculateStudentGPA(studentGrades);
          const categoryBreakdown = gradebookService.getCategoryBreakdown(studentGrades);
          
          return (
            <>
              {/* GPA Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <div className="flex items-center">
                    <ApperIcon name="Award" className="h-8 w-8 text-amber-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Overall GPA</p>
                      <p className="text-2xl font-bold">{overallGPA.gpa} <span className="text-lg font-medium text-gray-600">({overallGPA.letterGrade})</span></p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <ApperIcon name="BookOpen" className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Classes</p>
                      <p className="text-2xl font-bold">{studentGrades.length}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <ApperIcon name="Target" className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Average Grade</p>
                      <p className="text-2xl font-bold">
                        {studentGrades.length > 0 
                          ? Math.round(studentGrades.reduce((sum, cls) => sum + cls.currentGrade.percentage, 0) / studentGrades.length) + '%'
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <ApperIcon name="CheckCircle" className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Assignments Graded</p>
                      <p className="text-2xl font-bold">
                        {studentGrades.reduce((sum, cls) => sum + cls.assignments.filter(a => a.status === 'graded').length, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Category Breakdown */}
              {categoryBreakdown.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ApperIcon name="BarChart3" className="h-5 w-5 mr-2" />
                      Grade Breakdown by Category
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCategories(
                        expandedCategories.size === categoryBreakdown.length 
                          ? new Set() 
                          : new Set(categoryBreakdown.map((_, i) => i))
                      )}
                    >
                      {expandedCategories.size === categoryBreakdown.length ? 'Collapse All' : 'Expand All'}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {categoryBreakdown.map((category, index) => (
                      <div key={category.name} className="border rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            const newExpanded = new Set(expandedCategories);
                            if (newExpanded.has(index)) {
                              newExpanded.delete(index);
                            } else {
                              newExpanded.add(index);
                            }
                            setExpandedCategories(newExpanded);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <ApperIcon 
                                name={expandedCategories.has(index) ? "ChevronDown" : "ChevronRight"} 
                                className="h-5 w-5 text-gray-400" 
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {category.gradedCount} of {category.assignmentCount} assignments graded
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">{category.percentage}%</p>
                                  <p className="text-sm text-gray-600">{category.letterGrade}</p>
                                </div>
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      category.percentage >= 90 ? 'bg-emerald-500' :
                                      category.percentage >= 80 ? 'bg-blue-500' :
                                      category.percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Details */}
                        {expandedCategories.has(index) && (
                          <div className="p-4 border-t bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{category.earnedPoints}</p>
                                <p className="text-sm text-gray-600">Points Earned</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{category.totalPoints}</p>
                                <p className="text-sm text-gray-600">Total Points</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{category.completionRate}%</p>
                                <p className="text-sm text-gray-600">Completion Rate</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-900 mb-3">Recent Assignments</h5>
                              {category.assignments.slice(0, 5).map((assignment) => (
                                <div key={assignment.Id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-sm">{assignment.title}</p>
                                    <p className="text-xs text-gray-600">{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-sm">
                                      {assignment.grade !== null 
                                        ? `${assignment.grade}/${assignment.points}`
                                        : 'Not graded'
                                      }
                                    </p>
                                    {assignment.grade !== null && (
                                      <p className="text-xs text-gray-600">
                                        {Math.round((assignment.grade / assignment.points) * 100)}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {category.assignments.length > 5 && (
                                <p className="text-sm text-gray-600 text-center py-2">
                                  ...and {category.assignments.length - 5} more assignments
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          );
        })()}

        {/* Classes */}
        <div className="space-y-4">
          {studentGrades.map((classData) => (
            <Card key={classData.teacher.Id} className="overflow-hidden">
              {/* Class Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleClassExpansion(classData.teacher.Id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {classData.teacher.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{classData.className}</h3>
                      <p className="text-sm text-gray-600">Teacher: {classData.teacher.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{classData.currentGrade.letter}</span>
                        <span className="text-lg text-gray-600">({classData.currentGrade.percentage}%)</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {classData.currentGrade.points}/{classData.currentGrade.totalPoints} points
                      </p>
                    </div>
                    <ApperIcon 
                      name={expandedClasses.has(classData.teacher.Id) ? "ChevronUp" : "ChevronDown"} 
                      className="h-5 w-5 text-gray-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              {expandedClasses.has(classData.teacher.Id) && (
                <div className="border-t bg-gray-50">
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Assignment Details</h4>
                    <div className="space-y-3">
                      {classData.assignments.map((assignment) => (
                        <div key={assignment.Id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(assignment.status)}
                              <Badge variant={assignment.status === 'graded' ? 'success' : assignment.status === 'pending' ? 'warning' : 'secondary'}>
                                {getStatusText(assignment.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Grade</p>
                              <p className="font-medium">
                                {assignment.grade !== null 
                                  ? `${assignment.grade}/${assignment.points} (${Math.round((assignment.grade / assignment.points) * 100)}%)`
                                  : 'Not graded'
                                }
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p className="font-medium">{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500">Submitted</p>
                              <p className="font-medium">
                                {assignment.submittedAt 
                                  ? format(new Date(assignment.submittedAt), 'MMM d, yyyy')
                                  : 'Not submitted'
                                }
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500">Points</p>
                              <p className="font-medium">{assignment.points} pts</p>
                            </div>
                          </div>
                          
                          {assignment.feedback && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-gray-600 font-medium mb-1">Teacher Feedback:</p>
                              <p className="text-sm text-gray-800">{assignment.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
};

  if (loading) {
    return <Loading className="min-h-96" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={currentRole === 'teacher' ? loadGradebook : loadStudentGrades} />;
  }

  // Render student view for non-teachers
  if (currentRole !== 'teacher') {
    return renderStudentGrades();
  }

  // Teacher view continues as before
  if (!gradebookData || gradebookData.studentRows.length === 0) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="BookOpen" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Gradebook Data</h2>
        <p className="text-gray-600">
          Add students and assignments to start using the gradebook.
        </p>
      </div>
    );
  }

  const { assignments, studentRows, summary } = gradebookData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ApperIcon name="BookOpen" className="h-7 w-7 mr-3 text-primary-600" />
            Gradebook
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track student grades across all assignments
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {summary.totalStudents} Students
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {summary.totalAssignments} Assignments
          </Badge>
          <Button onClick={loadGradebook} variant="secondary" size="sm">
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

{/* Summary Stats with Class Average */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <ApperIcon name="Users" className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-xl font-semibold">{summary.totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ApperIcon name="Target" className="h-5 w-5 text-emerald-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Class Average</p>
              <p className="text-xl font-semibold">{gradebookService.getClassAverage(studentRows)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ApperIcon name="FileText" className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Submission Rate</p>
              <p className="text-xl font-semibold">{summary.submissionRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Grading Rate</p>
              <p className="text-xl font-semibold">{summary.gradingRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ApperIcon name="Clock" className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Pending Grades</p>
              <p className="text-xl font-semibold">{summary.pendingGrades}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grade Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Grade Legend</h3>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span>A (90-100%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
              <span>B/C (70-89%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
              <span>D/F (0-69%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></div>
              <span>Not Submitted</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Gradebook Grid */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-4 font-semibold sticky left-0 bg-gray-50 z-10 min-w-48">
                Student
              </th>
              {assignments.map(assignment => (
                <th key={assignment.Id} className="p-2 text-center min-w-20">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-gray-900 truncate max-w-20" title={assignment.title}>
                      {assignment.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(assignment.dueDate), 'MM/dd')}
                    </div>
                    <div className="text-xs font-medium text-primary-600">
                      {assignment.points} pts
                    </div>
                  </div>
                </th>
              ))}
              <th className="text-center p-4 font-semibold border-l-2 border-gray-300 min-w-24">
                Final Grade
              </th>
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {studentRows.map(({ student, grades, finalGrade }) => (
              <tr key={student.Id} className="border-b border-gray-100 hover:bg-gray-50">
                {/* Student Info */}
                <td className="p-4 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {student.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-500">{student.email || ''}</p>
                    </div>
                  </div>
                </td>
                
                {/* Grade Cells */}
                {grades.map(gradeData => renderGradeCell(gradeData, student))}
                
                {/* Final Grade */}
                {renderFinalGradeCell(finalGrade)}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900">How to use the gradebook:</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Click any grade cell to edit a student's score</li>
              <li>• Press Enter to save or Escape to cancel</li>
              <li>• Grades are color-coded: Green (A), Yellow (B/C), Red (D/F), Gray (Not submitted)</li>
              <li>• Final grades are automatically calculated based on assignment points</li>
              <li>• Leave a cell empty or enter 0 for unsubmitted assignments</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Grades;