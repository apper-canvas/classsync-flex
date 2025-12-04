import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from "date-fns";
import Chart from "react-apexcharts";
import gradebookService from "@/services/api/gradebookService";
import submissionService from "@/services/api/submissionService";
import userService from "@/services/api/userService";
import assignmentService from "@/services/api/assignmentService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Assignments from "@/components/pages/Assignments";
import StatCard from "@/components/molecules/StatCard";

const Analytics = () => {
  const { currentRole } = useOutletContext();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (currentRole !== "teacher") {
      return;
    }
    
    loadAnalyticsData();
  }, [currentRole]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [assignmentsData, submissionsData, studentsData] = await Promise.all([
        assignmentService.getActiveAssignments(),
        submissionService.getAll(),
        userService.getByRole("student")
      ]);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionTrendData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = subDays(new Date(), days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
    
    const submissionsByDate = dateRange.map(date => {
      const count = submissions.filter(s => {
        const submissionDate = new Date(s.submittedAt);
        return format(submissionDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      }).length;
      
      return {
        date: format(date, "MMM d"),
        submissions: count
      };
    });

    return {
      categories: submissionsByDate.map(d => d.date),
      data: submissionsByDate.map(d => d.submissions)
    };
  };

  const getGradeDistributionData = () => {
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
    const gradeRanges = {
      "A (90-100%)": 0,
      "B (80-89%)": 0,
      "C (70-79%)": 0,
      "D (60-69%)": 0,
      "F (0-59%)": 0
    };

    gradedSubmissions.forEach(submission => {
      const assignment = assignments.find(a => a.Id === submission.assignmentId);
      if (assignment) {
        const percentage = (submission.grade / assignment.points) * 100;
        if (percentage >= 90) gradeRanges["A (90-100%)"]++;
        else if (percentage >= 80) gradeRanges["B (80-89%)"]++;
        else if (percentage >= 70) gradeRanges["C (70-79%)"]++;
        else if (percentage >= 60) gradeRanges["D (60-69%)"]++;
        else gradeRanges["F (0-59%)"]++;
      }
    });

    return {
      labels: Object.keys(gradeRanges),
      data: Object.values(gradeRanges)
    };
  };

  const getSubjectPerformanceData = () => {
    const subjects = [...new Set(assignments.map(a => a.subject))];
    
    const subjectStats = subjects.map(subject => {
      const subjectAssignments = assignments.filter(a => a.subject === subject);
      const subjectSubmissions = submissions.filter(s => {
        const assignment = assignments.find(a => a.Id === s.assignmentId);
        return assignment?.subject === subject && s.grade !== null;
      });
      
      const avgGrade = subjectSubmissions.length > 0
        ? subjectSubmissions.reduce((sum, s) => {
            const assignment = assignments.find(a => a.Id === s.assignmentId);
            return sum + (assignment ? (s.grade / assignment.points) * 100 : 0);
          }, 0) / subjectSubmissions.length
        : 0;
      
      return {
        subject,
        avgGrade: Math.round(avgGrade),
        totalAssignments: subjectAssignments.length,
        completionRate: subjectAssignments.length > 0
          ? Math.round((subjectSubmissions.length / (subjectAssignments.length * students.length)) * 100)
          : 0
      };
    });

    return subjectStats;
  };

const getOverallStats = () => {
    const totalSubmissions = submissions.length;
    const pendingReviews = submissions.filter(s => s.status === "submitted").length;
    const avgGrade = submissions.filter(s => s.grade !== null).length > 0
      ? Math.round(
          submissions
            .filter(s => s.grade !== null)
            .reduce((sum, s) => {
              const assignment = assignments.find(a => a.Id === s.assignmentId);
              return sum + (assignment ? (s.grade / assignment.points) * 100 : 0);
            }, 0) / submissions.filter(s => s.grade !== null).length
        )
      : 0;
    
    const completionRate = assignments.length > 0 && students.length > 0
      ? Math.round((totalSubmissions / (assignments.length * students.length)) * 100)
      : 0;
const completionRate = assignments.length > 0 && students.length > 0
      ? Math.round((totalSubmissions / (assignments.length * students.length)) * 100)
      : 0;

    return {
      totalSubmissions,
      pendingReviews,
      avgGrade,
      completionRate
    };
  };

  if (currentRole !== "teacher") {
    return <ErrorView error="Access denied. Only teachers can view analytics." />;
  }

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadAnalyticsData} />;

  const trendData = getSubmissionTrendData();
  const gradeDistribution = getGradeDistributionData();
  const subjectPerformance = getSubjectPerformanceData();
  const stats = getOverallStats();

  const trendOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      foreColor: "#6B7280"
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#2563eb"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: "#2563eb", opacity: 0.7 },
          { offset: 100, color: "#2563eb", opacity: 0.1 }
        ]
      }
    },
    xaxis: {
      categories: trendData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { text: "Submissions" }
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4
    },
    tooltip: {
      theme: "light"
    }
};

  const gradeOptions = {
    chart: {
      type: "donut",
      height: 350,
      foreColor: "#6B7280"
    },
    labels: gradeDistribution.labels,
    colors: ["#10b981", "#2563eb", "#f59e0b", "#f97316", "#ef4444"],
    legend: {
      position: "bottom",
      fontSize: "14px"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 600
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              formatter: (val) => `${val}%`
            },
            total: {
              show: true,
              label: "Students",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280"
            }
          }
        }
      }
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `${val} students (${Math.round((val / students.length) * 100)}%)`
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Class Analytics
          </h1>
          <p className="text-gray-600 mt-2">Analyze student performance and engagement</p>
        </div>

        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon="FileText"
          gradient="blue"
          trend={{ direction: "up", value: "12%", label: "vs last period" }}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon="Clock"
          gradient="amber"
        />
        <StatCard
          title="Class Average"
          value={`${stats.avgGrade}%`}
          icon="TrendingUp"
          gradient="emerald"
          trend={{ direction: "up", value: "5%", label: "improvement" }}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon="CheckCircle"
          gradient="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="TrendingUp" className="h-5 w-5 mr-2" />
              Submission Trend
            </h3>
          </div>
          <Chart
            options={trendOptions}
            series={[{ name: "Submissions", data: trendData.data }]}
            type="area"
            height={350}
          />
        </Card>

{/* Grade Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="PieChart" className="h-5 w-5 mr-2" />
              Grade Distribution
            </h3>
<div className="text-right">
              <p className="text-sm text-gray-500">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}%</p>
            </div>
          </div>
          {gradeDistribution.data.every(val => val === 0) ? (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <div className="text-center">
                <ApperIcon name="BarChart3" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No Grade Data Available</p>
                <p className="text-sm mt-2">Grade distribution will appear once students have been graded</p>
              </div>
            </div>
          ) : (
            <Chart
              options={gradeOptions}
              series={gradeDistribution.data}
              type="donut"
              height={350}
            />
          )}
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="BookOpen" className="h-5 w-5 mr-2" />
            Subject Performance
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjectPerformance.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subject.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subject.totalAssignments}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{subject.avgGrade}%</div>
                      <div className={`ml-2 h-2 w-16 rounded-full ${
                        subject.avgGrade >= 90 ? "bg-emerald-200" :
                        subject.avgGrade >= 80 ? "bg-blue-200" :
                        subject.avgGrade >= 70 ? "bg-amber-200" : "bg-red-200"
                      }`}>
                        <div 
                          className={`h-2 rounded-full ${
                            subject.avgGrade >= 90 ? "bg-emerald-500" :
                            subject.avgGrade >= 80 ? "bg-blue-500" :
                            subject.avgGrade >= 70 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${subject.avgGrade}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subject.completionRate}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;