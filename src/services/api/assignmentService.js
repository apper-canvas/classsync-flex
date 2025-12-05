import assignmentsData from "@/services/mockData/assignments.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AssignmentService {
  constructor() {
    this.assignments = [...assignmentsData];
  }

  async getAll() {
    await delay(300);
    return [...this.assignments];
  }

  async getById(id) {
    await delay(200);
    const assignment = this.assignments.find(a => a.Id === parseInt(id));
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    return { ...assignment };
  }

  async getByTeacherId(teacherId) {
    await delay(250);
    return this.assignments
      .filter(a => a.teacherId === parseInt(teacherId))
      .map(a => ({ ...a }));
  }

  async getActiveAssignments() {
    await delay(250);
    return this.assignments
      .filter(a => a.status === "active")
      .map(a => ({ ...a }));
  }

async create(assignmentData) {
    await delay(400);
    const newId = Math.max(...this.assignments.map(a => a.Id)) + 1;
    const now = new Date().toISOString();
    const newAssignment = {
      Id: newId,
      ...assignmentData,
      createdAt: now,
      createdDate: now,
      lastModifiedDate: now,
      status: "active"
    };
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  async update(id, assignmentData) {
    await delay(350);
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    const updatedAssignment = { 
      ...this.assignments[index], 
      ...assignmentData,
      lastModifiedDate: new Date().toISOString()
    };
    this.assignments[index] = updatedAssignment;
    return { ...updatedAssignment };
  }

  async delete(id) {
    await delay(250);
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    const deletedAssignment = { ...this.assignments[index] };
    this.assignments.splice(index, 1);
    return deletedAssignment;
  }

  async getUpcomingForStudent() {
    await delay(300);
    const now = new Date();
    return this.assignments
      .filter(a => a.status === "active" && new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map(a => ({ ...a }));
}

  async getCalendarAssignments() {
    await delay(200);
    return this.assignments
      .filter(assignment => !assignment.isArchived)
      .map(assignment => ({
        ...assignment,
        date: assignment.dueDate,
        type: 'assignment'
      }));
  }

  async getAssignmentsByDateRange(startDate, endDate) {
    await delay(200);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.assignments
      .filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate >= start && dueDate <= end && !assignment.isArchived;
      })
      .map(assignment => ({ ...assignment }));
  }
}

export default new AssignmentService();