import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { format, isAfter, addDays, startOfDay } from "date-fns";
import StatCard from "@/components/molecules/StatCard";
import AssignmentCard from "@/components/molecules/AssignmentCard";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";

const Dashboard = () => {
  const { currentRole } = useOutletContext();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentService.getActiveAssignments(),
        submissionService.getAll()
      ]);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);

      if (currentRole === "teacher") {
        const studentsData = await userService.getByRole("student");
        setStudents(studentsData);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentRole]);

  const getTeacherStats = () => {
    const totalAssignments = assignments.length;
    const pendingReviews = submissions.filter(s => s.status === "submitted").length;
    const totalStudents = students.length;
    
    return { totalAssignments, pendingReviews, totalStudents };
  };

  const getStudentStats = () => {
    const studentId = 2; // Mock student ID
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);
    const totalAssignments = assignments.length;
    const submittedCount = studentSubmissions.filter(s => s.status !== "pending").length;
    const gradedCount = studentSubmissions.filter(s => s.status === "graded").length;
    const averageGrade = gradedCount > 0 
      ? Math.round(studentSubmissions
          .filter(s => s.grade !== null)
          .reduce((sum, s) => sum + s.grade, 0) / gradedCount)
      : 0;
    
    return { totalAssignments, submittedCount, gradedCount, averageGrade };
  };

  const getUpcomingAssignments = () => {
    const now = new Date();
    return assignments
      .filter(a => isAfter(new Date(a.dueDate), now))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    if (currentRole === "teacher") {
      return submissions
        .filter(s => s.status === "submitted")
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
    } else {
      const studentId = 2;
      return submissions
        .filter(s => s.studentId === studentId && s.status === "graded")
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
    }
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadDashboardData} />;

  const stats = currentRole === "teacher" ? getTeacherStats() : getStudentStats();
  const upcomingAssignments = getUpcomingAssignments();
  const recentActivity = getRecentActivity();

  const renderTeacherDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your classes and track student progress</p>
        </div>
        <Button onClick={() => navigate("assignments/new")}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon="FileText"
          gradient="blue"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon="Clock"
          gradient="amber"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="Users"
          gradient="emerald"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assignments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("assignments")}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingAssignments.length === 0 ? (
<Empty 
                icon="FileText"
                title="No assignments"
                description="Create your first assignment to get started"
                actionLabel="Create Assignment"
                onAction={() => navigate("assignments/new")}
              />
            ) : (
              upcomingAssignments.slice(0, 3).map(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const isDueSoon = isAfter(dueDate, new Date()) && isAfter(addDays(new Date(), 3), dueDate);
                const isOverdue = isAfter(startOfDay(new Date()), startOfDay(dueDate));
                
                return (
                  <div 
                    key={assignment.Id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assignments/${assignment.Id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={isOverdue ? "destructive" : isDueSoon ? "warning" : "info"}>
                          {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Upcoming"}
                        </Badge>
                        <span className="text-xs text-gray-500">{assignment.points} pts</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                      Due {format(dueDate, "MMM d")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("assignments")}>
              Review All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <Empty 
                icon="CheckCircle"
                title="No pending reviews"
                description="All submissions are up to date"
              />
            ) : (
              recentActivity.map(submission => {
                const assignment = assignments.find(a => a.Id === submission.assignmentId);
                return (
                  <div key={submission.Id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment?.title}</h3>
                        <p className="text-sm text-gray-600">Student submission pending review</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <ApperIcon name="Clock" className="h-4 w-4 mr-1" />
                      Submitted {format(new Date(submission.submittedAt), "MMM d")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your assignments and academic progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon="FileText"
          gradient="purple"
        />
        <StatCard
          title="Submitted"
          value={stats.submittedCount}
          icon="CheckCircle"
          gradient="emerald"
        />
        <StatCard
          title="Graded"
          value={stats.gradedCount}
          icon="Award"
          gradient="amber"
        />
        <StatCard
          title="Average Grade"
          value={stats.averageGrade > 0 ? `${stats.averageGrade}%` : "N/A"}
          icon="TrendingUp"
          gradient="blue"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Assignments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("assignments")}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingAssignments.length === 0 ? (
              <Empty 
icon="Calendar"
                title="No upcoming assignments"
                description="You're all caught up! Check back later for new assignments."
              />
            ) : (
              upcomingAssignments.slice(0, 3).map(assignment => {
                const submission = submissions.find(s => s.assignmentId === assignment.Id && s.studentId === 2);
                const dueDate = new Date(assignment.dueDate);
                const isDueSoon = isAfter(dueDate, new Date()) && isAfter(addDays(new Date(), 3), dueDate);
                const isOverdue = isAfter(startOfDay(new Date()), startOfDay(dueDate));
                
                return (
                  <div 
                    key={assignment.Id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assignments/${assignment.Id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={!submission ? (isOverdue ? "destructive" : isDueSoon ? "warning" : "info") : "success"}>
                          {!submission 
                            ? (isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Pending") 
                            : "Submitted"}
                        </Badge>
                        <span className="text-xs text-gray-500">{assignment.points} pts</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                      Due {format(dueDate, "MMM d")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent Grades */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Grades</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("grades")}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <Empty 
                icon="Award"
                title="No grades yet"
                description="Complete assignments to see your grades here"
              />
            ) : (
              recentActivity.map(submission => {
                const assignment = assignments.find(a => a.Id === submission.assignmentId);
                const percentage = assignment ? Math.round((submission.grade / assignment.points) * 100) : 0;
                
                return (
                  <div key={submission.Id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment?.title}</h3>
                        <p className="text-sm text-gray-600">{assignment?.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={percentage >= 90 ? "success" : percentage >= 80 ? "primary" : percentage >= 70 ? "warning" : "danger"}>
                          {submission.grade}/{assignment?.points}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">{percentage}%</div>
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        "{submission.feedback}"
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return currentRole === "teacher" ? renderTeacherDashboard() : renderStudentDashboard();
};

export default Dashboard;