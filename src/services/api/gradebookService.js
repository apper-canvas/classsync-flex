import assignmentService from './assignmentService';
import userService from './userService';
import submissionService from './submissionService';

class GradebookService {
  constructor() {
    this.cache = {
      gradebook: null,
      lastUpdated: null
    };
  }

  // Get complete gradebook data with students, assignments, and grades
  async getGradebookData() {
    try {
      const [assignments, students, submissions] = await Promise.all([
        assignmentService.getAll(),
        userService.getByRole('student'),
        submissionService.getAll()
      ]);

      const gradebookData = this.buildGradebookMatrix(assignments, students, submissions);
      
      this.cache.gradebook = gradebookData;
      this.cache.lastUpdated = Date.now();
      
      return gradebookData;
    } catch (error) {
      console.error('Error loading gradebook data:', error);
      throw error;
    }
  }

  // Build the gradebook matrix structure
  buildGradebookMatrix(assignments, students, submissions) {
    // Sort assignments by due date
    const sortedAssignments = [...assignments].sort((a, b) => 
      new Date(a.dueDate) - new Date(b.dueDate)
    );

    // Create student rows with grade data
    const studentRows = students.map(student => {
      const studentSubmissions = submissions.filter(s => s.studentId === student.Id);
      
      const grades = sortedAssignments.map(assignment => {
        const submission = studentSubmissions.find(s => s.assignmentId === assignment.Id);
        return {
          assignmentId: assignment.Id,
          studentId: student.Id,
          submissionId: submission?.Id || null,
          grade: submission?.grade || null,
          status: submission?.status || 'not_submitted',
          maxPoints: assignment.points
        };
      });

      const finalGrade = this.calculateFinalGrade(grades, sortedAssignments);

      return {
        student,
        grades,
        finalGrade
      };
    });

    return {
      assignments: sortedAssignments,
      students,
      studentRows,
      summary: this.calculateSummaryStats(studentRows, sortedAssignments)
    };
  }

  // Calculate final grade for a student
  calculateFinalGrade(grades, assignments) {
    const gradedAssignments = grades.filter(g => g.grade !== null);
    
    if (gradedAssignments.length === 0) {
      return { percentage: 0, letter: 'F', points: '0/0' };
    }

    let totalEarned = 0;
    let totalPossible = 0;

    gradedAssignments.forEach(grade => {
      const assignment = assignments.find(a => a.Id === grade.assignmentId);
      if (assignment) {
        totalEarned += grade.grade;
        totalPossible += assignment.points;
      }
    });

    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    const letter = this.getLetterGrade(percentage);

    return {
      percentage,
      letter,
      points: `${totalEarned}/${totalPossible}`
    };
  }

  // Convert percentage to letter grade
  getLetterGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // Get grade color based on percentage
  getGradeColor(percentage) {
    if (percentage >= 90) return 'text-green-600 bg-green-50'; // A
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50'; // B/C
    if (percentage >= 60) return 'text-red-600 bg-red-50'; // D/F
    return 'text-gray-500 bg-gray-50'; // Not submitted
  }

  // Get grade cell color for individual grades
  getGradeCellColor(grade, maxPoints) {
    if (grade === null) return 'bg-gray-50 text-gray-400';
    
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'bg-green-50 text-green-700 border-green-200';
    if (percentage >= 70) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (percentage >= 60) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-red-50 text-red-700 border-red-200';
  }

  // Calculate summary statistics
  calculateSummaryStats(studentRows, assignments) {
    const totalStudents = studentRows.length;
    const totalAssignments = assignments.length;
    
    let totalSubmissions = 0;
    let gradedSubmissions = 0;
    
    studentRows.forEach(row => {
      row.grades.forEach(grade => {
        if (grade.status !== 'not_submitted') {
          totalSubmissions++;
        }
        if (grade.grade !== null) {
          gradedSubmissions++;
        }
      });
    });

    const submissionRate = totalStudents * totalAssignments > 0 
      ? Math.round((totalSubmissions / (totalStudents * totalAssignments)) * 100)
      : 0;

    const gradingRate = totalSubmissions > 0 
      ? Math.round((gradedSubmissions / totalSubmissions) * 100) 
      : 0;

    return {
      totalStudents,
      totalAssignments,
      submissionRate,
      gradingRate,
      pendingGrades: totalSubmissions - gradedSubmissions
    };
  }

  // Update a grade
  async updateGrade(studentId, assignmentId, grade) {
    try {
      // Find or create submission
      const submissions = await submissionService.getAll();
      let submission = submissions.find(s => 
        s.studentId === parseInt(studentId) && s.assignmentId === parseInt(assignmentId)
      );

      if (submission) {
        // Update existing submission
        await submissionService.grade(submission.Id, grade, '');
      } else {
        // Create new submission with grade
        const newSubmission = {
          studentId: parseInt(studentId),
          assignmentId: parseInt(assignmentId),
          content: '',
          files: [],
          links: [],
          status: 'graded'
        };
        const created = await submissionService.create(newSubmission);
        await submissionService.grade(created.Id, grade, '');
      }

      // Clear cache to force reload
      this.cache.gradebook = null;
      
      return true;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  }

  // Get assignment statistics
  getAssignmentStats(assignmentId, studentRows) {
    const grades = studentRows
      .map(row => row.grades.find(g => g.assignmentId === assignmentId))
      .filter(g => g && g.grade !== null)
      .map(g => g.grade);

    if (grades.length === 0) {
      return {
        submitted: 0,
        average: 0,
        highest: 0,
        lowest: 0
      };
    }

    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    const average = Math.round(sum / grades.length);
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    return {
      submitted: grades.length,
      average,
      highest,
      lowest
    };
  }

  // Validate grade input
  validateGrade(grade, maxPoints) {
    const numGrade = parseFloat(grade);
    
    if (isNaN(numGrade)) {
      throw new Error('Grade must be a number');
    }
    
    if (numGrade < 0) {
      throw new Error('Grade cannot be negative');
    }
    
    if (numGrade > maxPoints) {
      throw new Error(`Grade cannot exceed ${maxPoints} points`);
    }
    
    return numGrade;
  }

  // Clear cache
  clearCache() {
    this.cache.gradebook = null;
    this.cache.lastUpdated = null;
  }
// Get class average from student final grades
  getClassAverage(studentRows) {
    if (!studentRows || studentRows.length === 0) {
      return 0;
    }

    const studentsWithGrades = studentRows.filter(row => 
      row.finalGrade && row.finalGrade.percentage > 0
    );

    if (studentsWithGrades.length === 0) {
      return 0;
    }

    const totalPercentage = studentsWithGrades.reduce((sum, row) => 
      sum + row.finalGrade.percentage, 0
    );

    return Math.round(totalPercentage / studentsWithGrades.length);
  }

  // Get grade distribution for analytics
  getGradeDistribution(studentRows) {
    if (!studentRows || studentRows.length === 0) {
      return { A: 0, B: 0, C: 0, D: 0, F: 0 };
    }

    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    studentRows.forEach(row => {
      if (row.finalGrade && row.finalGrade.percentage > 0) {
        const percentage = row.finalGrade.percentage;
        if (percentage >= 90) distribution.A++;
        else if (percentage >= 80) distribution.B++;
        else if (percentage >= 70) distribution.C++;
        else if (percentage >= 60) distribution.D++;
        else distribution.F++;
      }
    });

    return distribution;
  }
}

// Export singleton instance
const gradebookService = new GradebookService();
export default gradebookService;