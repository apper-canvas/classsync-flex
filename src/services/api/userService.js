import usersData from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UserService {
  constructor() {
    this.users = [...usersData];
  }

  async getAll() {
    await delay(300);
    return [...this.users];
  }

  async getById(id) {
    await delay(200);
    const user = this.users.find(u => u.Id === parseInt(id));
    if (!user) {
      throw new Error("User not found");
    }
    return { ...user };
  }

  async getByRole(role) {
    await delay(250);
    return this.users.filter(u => u.role === role).map(u => ({ ...u }));
  }

  async create(userData) {
    await delay(400);
    const newId = Math.max(...this.users.map(u => u.Id)) + 1;
    const newUser = {
      Id: newId,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id, userData) {
    await delay(350);
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) {
      throw new Error("User not found");
    }
    this.users[index] = { ...this.users[index], ...userData };
    return { ...this.users[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) {
      throw new Error("User not found");
    }
    const deletedUser = { ...this.users[index] };
    this.users.splice(index, 1);
    return deletedUser;
  }

  async getCurrentUser() {
    await delay(200);
    // Simulate getting current user - defaulting to teacher for demo
    return { ...this.users[0] };
  }
}

export default new UserService();