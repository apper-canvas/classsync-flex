import resourcesData from "@/services/mockData/resources.json";

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ResourceService {
  constructor() {
    this.resources = [...resourcesData];
    this.nextId = Math.max(...this.resources.map(r => r.Id), 0) + 1;
  }

  async getAll() {
    await delay(300);
    return [...this.resources];
  }

  async getById(id) {
    await delay(200);
    const resource = this.resources.find(r => r.Id === parseInt(id));
    if (!resource) {
      throw new Error('Resource not found');
    }
    return { ...resource };
  }

  async getByClass(classId) {
    await delay(300);
    return this.resources
      .filter(r => r.classId === parseInt(classId))
      .map(r => ({ ...r }));
  }

  async getByCategory(category) {
    await delay(300);
    return this.resources
      .filter(r => r.category === category)
      .map(r => ({ ...r }));
  }

  async getBySubject(subject) {
    await delay(300);
    return this.resources
      .filter(r => r.subject === subject)
      .map(r => ({ ...r }));
  }

  async getVisible(userRole, classId = null) {
    await delay(300);
    return this.resources
      .filter(r => {
        if (r.visibility === 'public') return true;
        if (r.visibility === 'class' && classId) {
          return r.classId === parseInt(classId);
        }
        return userRole === 'teacher';
      })
      .map(r => ({ ...r }));
  }

  async create(resourceData) {
    await delay(500);
    
    const newResource = {
      Id: this.nextId++,
      title: resourceData.title,
      description: resourceData.description || '',
      type: resourceData.type,
      subject: resourceData.subject,
      category: resourceData.category || 'General',
      fileType: resourceData.fileType || 'Unknown',
      fileName: resourceData.fileName || '',
      fileSize: resourceData.fileSize || 0,
      size: this.formatFileSize(resourceData.fileSize || 0),
      url: resourceData.url || '', // For external links
      visibility: resourceData.visibility || 'public',
      classId: resourceData.classId || null,
      uploadedBy: resourceData.uploadedBy || 1,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      tags: resourceData.tags || []
    };

    this.resources.push(newResource);
    return { ...newResource };
  }

  async update(id, resourceData) {
    await delay(400);
    
    const index = this.resources.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Resource not found');
    }

    const updatedResource = {
      ...this.resources[index],
      ...resourceData,
      Id: parseInt(id), // Preserve ID
      updatedAt: new Date().toISOString()
    };

    this.resources[index] = updatedResource;
    return { ...updatedResource };
  }

  async delete(id) {
    await delay(300);
    
    const index = this.resources.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Resource not found');
    }

    const deletedResource = this.resources.splice(index, 1)[0];
    return { ...deletedResource };
  }

  async incrementDownload(id) {
    await delay(200);
    
    const resource = this.resources.find(r => r.Id === parseInt(id));
    if (resource) {
      resource.downloadCount = (resource.downloadCount || 0) + 1;
      return { ...resource };
    }
    throw new Error('Resource not found');
  }

  async getCategories() {
    await delay(100);
    const categories = [...new Set(this.resources.map(r => r.category))];
    return categories.filter(Boolean).sort();
  }

  async getSubjects() {
    await delay(100);
    const subjects = [...new Set(this.resources.map(r => r.subject))];
    return subjects.filter(Boolean).sort();
  }

  async getTypes() {
    await delay(100);
    const types = [...new Set(this.resources.map(r => r.type))];
    return types.filter(Boolean).sort();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Utility methods for resource management
  async searchResources(query, filters = {}) {
    await delay(300);
    
    let results = [...this.resources];
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(searchTerm) ||
        r.description.toLowerCase().includes(searchTerm) ||
        r.subject.toLowerCase().includes(searchTerm) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    // Apply filters
    if (filters.type) {
      results = results.filter(r => r.type === filters.type);
    }
    if (filters.subject) {
      results = results.filter(r => r.subject === filters.subject);
    }
    if (filters.category) {
      results = results.filter(r => r.category === filters.category);
    }
    if (filters.visibility) {
      results = results.filter(r => r.visibility === filters.visibility);
    }
    
    return results.map(r => ({ ...r }));
  }

  async getResourcesByTeacher(teacherId) {
    await delay(300);
    return this.resources
      .filter(r => r.uploadedBy === parseInt(teacherId))
      .map(r => ({ ...r }));
  }
}

export default new ResourceService();