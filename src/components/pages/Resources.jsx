import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import FileUpload from "@/components/atoms/FileUpload";
import { toast } from "react-toastify";
import resourceService from "@/services/api/resourceService";
import classService from "@/services/api/classService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Label from "@/components/atoms/Label";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
const Resources = () => {
  const { currentRole } = useOutletContext();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [types, setTypes] = useState([]);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'Document',
    subject: '',
    category: '',
    visibility: 'public',
    classId: '',
    url: '', // For external links
    isExternalLink: false
  });
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    type: '',
    subject: '',
    category: '',
    visibility: 'public',
    classId: '',
    url: ''
  });

  const resourceTypes = [
    'Document', 'Video', 'Audio', 'Image', 'Presentation', 
    'Spreadsheet', 'Study Guide', 'Reference', 'Examples', 
    'Interactive Content', 'External Link'
  ];

  const visibilityOptions = [
    { value: 'public', label: 'All Students' },
    { value: 'class', label: 'Specific Class' },
    { value: 'private', label: 'Private (Teachers Only)' }
  ];
useEffect(() => {
    loadResources();
    loadMetadata();
  }, [currentRole]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAll();
      setResources(data);
      setError("");
    } catch (err) {
      setError("Failed to load resources");
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [classData, categoryData, subjectData, typeData] = await Promise.all([
        classService.getAll(),
        resourceService.getCategories(),
        resourceService.getSubjects(),
        resourceService.getTypes()
      ]);
      setClasses(classData);
      setCategories(categoryData);
      setSubjects(subjectData);
      setTypes(typeData);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const handleUpload = async () => {
    try {
      if (!uploadData.title.trim()) {
        toast.error("Please enter a title");
        return;
      }

      if (!uploadData.isExternalLink && uploadFiles.length === 0) {
        toast.error("Please select files to upload or add an external link");
        return;
      }

      if (uploadData.isExternalLink && !uploadData.url.trim()) {
        toast.error("Please enter a valid URL");
        return;
      }

      setUploading(true);

      if (uploadData.isExternalLink) {
        // Handle external link
        await resourceService.create({
          ...uploadData,
          fileType: 'External Link',
          fileName: 'External Link',
          fileSize: 0
        });
        toast.success("External link added successfully");
      } else {
        // Handle file uploads
        for (const fileObj of uploadFiles) {
          await resourceService.create({
            ...uploadData,
            fileName: fileObj.name,
            fileSize: fileObj.size,
            fileType: fileObj.type
          });
        }
        toast.success(`${uploadFiles.length} file(s) uploaded successfully`);
      }

      // Reset form
      setUploadData({
        title: '',
        description: '',
        type: 'Document',
        subject: '',
        category: '',
        visibility: 'public',
        classId: '',
        url: '',
        isExternalLink: false
      });
      setUploadFiles([]);
      setShowUploadForm(false);
      
      // Reload resources
      loadResources();
      
    } catch (err) {
      toast.error("Failed to upload resource");
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setEditData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      subject: resource.subject,
      category: resource.category || '',
      visibility: resource.visibility,
      classId: resource.classId || '',
      url: resource.url || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editData.title.trim()) {
        toast.error("Please enter a title");
        return;
      }

      await resourceService.update(editingResource.Id, editData);
      toast.success("Resource updated successfully");
      setShowEditModal(false);
      setEditingResource(null);
      loadResources();
    } catch (err) {
      toast.error("Failed to update resource");
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      return;
    }

    try {
      await resourceService.delete(resource.Id);
      toast.success("Resource deleted successfully");
      loadResources();
    } catch (err) {
      toast.error("Failed to delete resource");
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (resource) => {
    try {
      await resourceService.incrementDownload(resource.Id);
      
      if (resource.url && resource.fileType === 'External Link') {
        window.open(resource.url, '_blank');
        toast.success(`Opened ${resource.title}`);
      } else {
        toast.success(`Downloaded ${resource.title}`);
      }
      
      // Update the download count in UI
      setResources(prev => prev.map(r => 
        r.Id === resource.Id 
          ? { ...r, downloadCount: r.downloadCount + 1 }
          : r
      ));
    } catch (err) {
      toast.error("Failed to access resource");
      console.error('Download error:', err);
}
  };
const getFilteredResources = () => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(r => r.subject === filterSubject);
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    // Sort by upload date (newest first)
    filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return filtered;
  };

  const getUniqueTypes = () => {
    return [...new Set(resources.map(r => r.type))].sort();
  };

  const getUniqueSubjects = () => {
    return [...new Set(resources.map(r => r.subject))].sort();
  };
const getFileIcon = (fileType) => {
    if (fileType === 'External Link') return 'ExternalLink';
    if (fileType?.startsWith('image') || fileType === 'PNG' || fileType === 'JPG' || fileType === 'JPEG') return 'Image';
    if (fileType === 'PDF' || fileType === 'application/pdf') return 'FileText';
    if (fileType?.includes('video') || fileType === 'MP4') return 'Video';
    if (fileType?.includes('audio') || fileType === 'MP3') return 'Music';
    if (fileType?.includes('presentation') || fileType === 'PPTX') return 'Presentation';
    if (fileType?.includes('spreadsheet') || fileType === 'XLSX') return 'Sheet';
    return 'FileText';
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      'Study Guide': 'blue',
      'Video': 'purple',
      'Audio': 'green',
      'Reference': 'amber',
      'Examples': 'indigo',
      'Interactive Content': 'pink',
      'External Link': 'orange',
      'Document': 'gray',
      'Presentation': 'cyan'
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadResources} />;
}

  const filteredResources = getFilteredResources();
  
  return (
<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {currentRole === 'teacher' ? 'Resource Management' : 'Learning Resources'}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentRole === 'teacher' 
              ? 'Upload, organize and manage class resources'
              : 'Access study materials, guides, and supplementary content'
            }
          </p>
        </div>
        
        {currentRole === 'teacher' && (
          <Button 
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Teacher Upload Form */}
      {currentRole === 'teacher' && showUploadForm && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Resource</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowUploadForm(false)}
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter resource title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter resource description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    id="type"
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={uploadData.subject}
                    onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Chemistry"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Study Materials, Reference"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    id="visibility"
                    value={uploadData.visibility}
                    onChange={(e) => setUploadData(prev => ({ ...prev, visibility: e.target.value }))}
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </div>

                {uploadData.visibility === 'class' && (
                  <div>
                    <Label htmlFor="classId">Select Class</Label>
                    <Select
                      id="classId"
                      value={uploadData.classId}
                      onChange={(e) => setUploadData(prev => ({ ...prev, classId: e.target.value }))}
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.Id} value={cls.Id}>{cls.name}</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isExternalLink"
                    checked={uploadData.isExternalLink}
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      isExternalLink: e.target.checked,
                      type: e.target.checked ? 'External Link' : 'Document'
                    }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isExternalLink">External Link</Label>
                </div>

                {uploadData.isExternalLink ? (
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={uploadData.url}
                      onChange={(e) => setUploadData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Files</Label>
                    <FileUpload
                      onFilesChange={setUploadFiles}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'application/vnd.ms-powerpoint': ['.ppt'],
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                        'application/vnd.ms-excel': ['.xls'],
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                        'text/*': ['.txt', '.csv'],
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                        'video/*': ['.mp4', '.avi', '.mov'],
                        'audio/*': ['.mp3', '.wav', '.ogg']
                      }}
                      maxSize={50485760} // 50MB
                      maxFiles={10}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowUploadForm(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                {uploading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 mr-4">
              <ApperIcon name="BookOpen" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
              <p className="text-sm text-gray-600">Total Resources</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-4">
              <ApperIcon name="Download" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Downloads</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-4">
              <ApperIcon name="Folder" className="h-6 w-6 text-white" />
            </div>
            <div>
<p className="text-2xl font-bold text-gray-900">{[...new Set(resources.map(r => r.subject))].length}</p>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-4">
              <ApperIcon name="Star" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{[...new Set(resources.map(r => r.type))].length}</p>
              <p className="text-sm text-gray-600">Resource Types</p>
            </div>
          </div>
        </Card>
      </div>

{/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
className="w-full sm:w-40"
          >
            <option value="">All Types</option>
{types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <Select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">All Subjects</option>
            {[...new Set(resources.map(r => r.subject))].sort().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>

          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-40"
>
            <option value="">All Categories</option>
            {[...new Set(resources.map(r => r.category).filter(Boolean))].sort().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
      </Card>

{/* Resources Display */}
      {filteredResources.length === 0 ? (
        <Empty 
          icon="BookOpen"
          title={searchTerm || filterType || filterSubject || filterCategory ? "No matching resources found" : "No resources available"}
          description={searchTerm || filterType || filterSubject || filterCategory ? "Try adjusting your search criteria" : "Check back later for new learning materials"}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <Card key={resource.Id} className="p-6 hover:shadow-card-hover transition-shadow duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ApperIcon name={getFileIcon(resource.fileType)} className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                      <p className="text-sm text-gray-600">{resource.subject}</p>
                      {resource.category && (
                        <p className="text-xs text-gray-500">{resource.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={getTypeBadgeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                    {resource.visibility === 'class' && (
                      <Badge variant="amber" size="sm">Class Only</Badge>
                    )}
                    {resource.visibility === 'private' && (
                      <Badge variant="red" size="sm">Private</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{resource.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{resource.fileType?.toUpperCase() || 'UNKNOWN'}</span>
                    <span>{resource.size}</span>
                  </div>
                  <div className="flex items-center">
                    <ApperIcon name="Download" className="h-3 w-3 mr-1" />
                    <span>{resource.downloadCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toast.info(`Previewing ${resource.title}`)}
                    >
                      <ApperIcon name="Eye" className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    
                    {currentRole === 'teacher' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(resource)}
                        >
                          <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(resource)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>

                  <Button 
                    variant="purple" 
                    size="sm"
                    onClick={() => handleDownload(resource)}
                  >
                    <ApperIcon name={resource.fileType === 'External Link' ? 'ExternalLink' : 'Download'} className="h-4 w-4 mr-1" />
                    {resource.fileType === 'External Link' ? 'Open' : 'Download'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Resource</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowEditModal(false)}
                  >
                    <ApperIcon name="X" className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter resource title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter resource description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-type">Type</Label>
                      <Select
                        id="edit-type"
                        value={editData.type}
                        onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        {resourceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-subject">Subject</Label>
                      <Input
                        id="edit-subject"
                        value={editData.subject}
                        onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Mathematics, Chemistry"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-category">Category</Label>
                      <Input
                        id="edit-category"
                        value={editData.category}
                        onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Study Materials, Reference"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-visibility">Visibility</Label>
                      <Select
                        id="edit-visibility"
                        value={editData.visibility}
                        onChange={(e) => setEditData(prev => ({ ...prev, visibility: e.target.value }))}
                      >
                        {visibilityOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                    </div>

                    {editData.visibility === 'class' && (
                      <div>
                        <Label htmlFor="edit-classId">Select Class</Label>
                        <Select
                          id="edit-classId"
                          value={editData.classId}
                          onChange={(e) => setEditData(prev => ({ ...prev, classId: e.target.value }))}
                        >
                          <option value="">Select a class</option>
                          {classes.map(cls => (
                            <option key={cls.Id} value={cls.Id}>{cls.name}</option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {editingResource.fileType === 'External Link' && (
                      <div>
                        <Label htmlFor="edit-url">URL</Label>
                        <Input
                          id="edit-url"
                          type="url"
                          value={editData.url}
                          onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">File Information</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Type:</strong> {editingResource.fileType}
                      </p>
                      {editingResource.fileName && (
                        <p className="text-sm text-gray-600">
                          <strong>File:</strong> {editingResource.fileName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <strong>Size:</strong> {editingResource.size}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Downloads:</strong> {editingResource.downloadCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdate}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  >
                    <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;