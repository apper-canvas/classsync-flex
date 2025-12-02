import classesData from "@/services/mockData/classes.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ClassService {
  constructor() {
    this.classes = [...classesData];
  }

  async getAll() {
    await delay(300);
    return [...this.classes];
  }

  async getById(id) {
    await delay(200);
    const classItem = this.classes.find(c => c.Id === parseInt(id));
    if (!classItem) {
      throw new Error("Class not found");
    }
    return { ...classItem };
  }

  async getByTeacherId(teacherId) {
    await delay(250);
    return this.classes
      .filter(c => c.teacherId === parseInt(teacherId))
      .map(c => ({ ...c }));
  }

  async getStudentsInClass(classId) {
    await delay(200);
    const classItem = this.classes.find(c => c.Id === parseInt(classId));
    if (!classItem) {
      throw new Error("Class not found");
    }
    return [...classItem.studentIds];
  }

  async create(classData) {
    await delay(400);
    const newId = Math.max(...this.classes.map(c => c.Id)) + 1;
    const newClass = {
      Id: newId,
      ...classData,
      studentIds: classData.studentIds || []
    };
    this.classes.push(newClass);
    return { ...newClass };
  }

  async update(id, classData) {
    await delay(350);
    const index = this.classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    this.classes[index] = { ...this.classes[index], ...classData };
    return { ...this.classes[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    const deletedClass = { ...this.classes[index] };
    this.classes.splice(index, 1);
    return deletedClass;
  }

  async addStudentToClass(classId, studentId) {
    await delay(300);
    const index = this.classes.findIndex(c => c.Id === parseInt(classId));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    const studentIdInt = parseInt(studentId);
    if (!this.classes[index].studentIds.includes(studentIdInt)) {
      this.classes[index].studentIds.push(studentIdInt);
    }
    
    return { ...this.classes[index] };
  }

  async removeStudentFromClass(classId, studentId) {
    await delay(300);
    const index = this.classes.findIndex(c => c.Id === parseInt(classId));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    const studentIdInt = parseInt(studentId);
    this.classes[index].studentIds = this.classes[index].studentIds.filter(
      id => id !== studentIdInt
    );
    
    return { ...this.classes[index] };
  }
}

export default new ClassService();