const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CalendarService {
  constructor() {
    this.events = [
      {
        Id: 1,
        title: "Spring Break",
        date: "2024-03-18",
        endDate: "2024-03-22",
        type: "holiday",
        isMultiDay: true,
        color: "#10B981"
      },
      {
        Id: 2,
        title: "Parent-Teacher Conferences",
        date: "2024-02-15",
        type: "school_event",
        color: "#8B5CF6"
      },
      {
        Id: 3,
        title: "Mid-term Exams Begin",
        date: "2024-02-20",
        type: "exam_period",
        color: "#EF4444"
      },
      {
        Id: 4,
        title: "Mid-term Exams End",
        date: "2024-02-24",
        type: "exam_period",
        color: "#EF4444"
      },
      {
        Id: 5,
        title: "Science Fair",
        date: "2024-03-10",
        type: "school_event",
        color: "#06B6D4"
      },
      {
        Id: 6,
        title: "Memorial Day - No Classes",
        date: "2024-05-27",
        type: "holiday",
        color: "#10B981"
      },
      {
        Id: 7,
        title: "Final Exams Begin",
        date: "2024-05-15",
        type: "exam_period",
        color: "#EF4444"
      },
      {
        Id: 8,
        title: "Graduation Ceremony",
        date: "2024-06-05",
        type: "school_event",
        color: "#F59E0B"
      }
    ];

    this.examSchedule = [
      {
        Id: 1,
        title: "Mathematics Mid-term",
        date: "2024-02-21",
        time: "09:00",
        duration: 120,
        subject: "Mathematics",
        type: "exam",
        color: "#3B82F6"
      },
      {
        Id: 2,
        title: "Science Lab Practical",
        date: "2024-02-22",
        time: "14:00",
        duration: 90,
        subject: "Science",
        type: "exam",
        color: "#10B981"
      },
      {
        Id: 3,
        title: "History Final Project Presentation",
        date: "2024-03-05",
        time: "10:00",
        duration: 60,
        subject: "History", 
        type: "project_deadline",
        color: "#8B5CF6"
      },
      {
        Id: 4,
        title: "English Literature Essay",
        date: "2024-03-12",
        time: "23:59",
        duration: 0,
        subject: "English",
        type: "project_deadline",
        color: "#F59E0B"
      }
    ];
  }

  async getAll() {
    await delay(200);
    return [...this.events];
  }

  async getEventsByDateRange(startDate, endDate) {
    await delay(200);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    }).map(event => ({ ...event }));
  }

  async getEventsByDate(date) {
    await delay(200);
    const targetDate = new Date(date).toDateString();
    
    return this.events.filter(event => {
      if (event.isMultiDay) {
        const startDate = new Date(event.date);
        const endDate = new Date(event.endDate);
        const target = new Date(date);
        return target >= startDate && target <= endDate;
      }
      return new Date(event.date).toDateString() === targetDate;
    }).map(event => ({ ...event }));
  }

  async getExamSchedule() {
    await delay(200);
    return [...this.examSchedule];
  }

  async getExamsByDateRange(startDate, endDate) {
    await delay(200);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.examSchedule.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate >= start && examDate <= end;
    }).map(exam => ({ ...exam }));
  }

  async getExamsByDate(date) {
    await delay(200);
    const targetDate = new Date(date).toDateString();
    
    return this.examSchedule.filter(exam => {
      return new Date(exam.date).toDateString() === targetDate;
    }).map(exam => ({ ...exam }));
  }

  async getHolidays() {
    await delay(200);
    return this.events
      .filter(event => event.type === "holiday")
      .map(event => ({ ...event }));
  }

  async getSchoolEvents() {
    await delay(200);
    return this.events
      .filter(event => event.type === "school_event")
      .map(event => ({ ...event }));
  }

  async create(eventData) {
    await delay(300);
    const newId = Math.max(...this.events.map(e => e.Id)) + 1;
    const newEvent = {
      Id: newId,
      ...eventData,
      createdAt: new Date().toISOString()
    };
    this.events.push(newEvent);
    return { ...newEvent };
  }

  async update(id, eventData) {
    await delay(300);
    const index = this.events.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Event not found");
    }
    this.events[index] = { ...this.events[index], ...eventData };
    return { ...this.events[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.events.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Event not found");
    }
    const deletedEvent = { ...this.events[index] };
    this.events.splice(index, 1);
    return deletedEvent;
  }
}

export default new CalendarService();