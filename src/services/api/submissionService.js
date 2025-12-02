import submissionsData from "@/services/mockData/submissions.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SubmissionService {
  constructor() {
    this.submissions = [...submissionsData];
  }

  async getAll() {
    await delay(300);
    return [...this.submissions];
  }

  async getById(id) {
    await delay(200);
    const submission = this.submissions.find(s => s.Id === parseInt(id));
    if (!submission) {
      throw new Error("Submission not found");
    }
    return { ...submission };
  }

  async getByAssignmentId(assignmentId) {
    await delay(250);
    return this.submissions
      .filter(s => s.assignmentId === parseInt(assignmentId))
      .map(s => ({ ...s }));
  }

  async getByStudentId(studentId) {
    await delay(250);
    return this.submissions
      .filter(s => s.studentId === parseInt(studentId))
      .map(s => ({ ...s }));
  }

  async getSubmission(assignmentId, studentId) {
    await delay(200);
    const submission = this.submissions.find(s => 
      s.assignmentId === parseInt(assignmentId) && 
      s.studentId === parseInt(studentId)
    );
    return submission ? { ...submission } : null;
  }

  async create(submissionData) {
    await delay(400);
    const newId = Math.max(...this.submissions.map(s => s.Id)) + 1;
    const newSubmission = {
      Id: newId,
      ...submissionData,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null,
      status: "submitted"
    };
    this.submissions.push(newSubmission);
    return { ...newSubmission };
  }

  async update(id, submissionData) {
    await delay(350);
    const index = this.submissions.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Submission not found");
    }
    this.submissions[index] = { ...this.submissions[index], ...submissionData };
    return { ...this.submissions[index] };
  }

  async grade(id, grade, feedback) {
    await delay(350);
    const index = this.submissions.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Submission not found");
    }
    this.submissions[index] = {
      ...this.submissions[index],
      grade: parseInt(grade),
      feedback,
      status: "graded"
    };
    return { ...this.submissions[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.submissions.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Submission not found");
    }
    const deletedSubmission = { ...this.submissions[index] };
    this.submissions.splice(index, 1);
    return deletedSubmission;
  }

  async getPendingGrading(teacherId) {
    await delay(300);
    // Get submissions that need grading for teacher's assignments
    return this.submissions
      .filter(s => s.status === "submitted")
      .map(s => ({ ...s }));
  }
}

export default new SubmissionService();