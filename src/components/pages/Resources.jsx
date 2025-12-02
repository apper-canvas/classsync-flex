import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const Resources = () => {
  const { currentRole } = useOutletContext();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Mock resources data
  const mockResources = [
    {
      Id: 1,
      title: "Algebra Study Guide",
      description: "Comprehensive guide covering linear equations, quadratic functions, and polynomial operations.",
      type: "Study Guide",
      subject: "Mathematics",
      fileType: "PDF",
      size: "2.4 MB",
      uploadedAt: "2024-12-10T10:00:00Z",
      downloadCount: 45
    },
    {
      Id: 2,
      title: "Chemistry Lab Safety Video",
      description: "Important safety protocols and procedures for chemistry laboratory work.",
      type: "Video",
      subject: "Chemistry",
      fileType: "MP4",
      size: "156 MB",
      uploadedAt: "2024-12-08T14:30:00Z",
      downloadCount: 23
    },
    {
      Id: 3,
      title: "World War II Timeline",
      description: "Interactive timeline showing major events and turning points of World War II.",
      type: "Interactive Content",
      subject: "History",
      fileType: "HTML",
      size: "5.1 MB",
      uploadedAt: "2024-12-12T09:15:00Z",
      downloadCount: 31
    },
    {
      Id: 4,
      title: "Physics Formula Sheet",
      description: "Essential formulas for mechanics, thermodynamics, and electromagnetism.",
      type: "Reference",
      subject: "Physics",
      fileType: "PDF",
      size: "1.2 MB",
      uploadedAt: "2024-12-05T16:20:00Z",
      downloadCount: 67
    },
    {
      Id: 5,
      title: "English Literature Essay Examples",
      description: "Sample essays analyzing themes in classic literature works.",
      type: "Examples",
      subject: "English Literature",
      fileType: "DOCX",
      size: "3.8 MB",
      uploadedAt: "2024-12-07T11:45:00Z",
      downloadCount: 52
    },
    {
      Id: 6,
      title: "Biology Cell Structure Diagram",
      description: "Detailed diagrams of plant and animal cell structures with labels.",
      type: "Diagram",
      subject: "Biology",
      fileType: "PNG",
      size: "4.2 MB",
      uploadedAt: "2024-12-09T13:30:00Z",
      downloadCount: 38
    }
  ];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setResources(mockResources);
    } catch (err) {
      console.error("Error loading resources:", err);
      setError("Failed to load resources");
    } finally {
      setLoading(false);
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

  const handleDownload = (resource) => {
    // Simulate download
    toast.success(`Downloading ${resource.title}`);
    
    // Update download count
    setResources(prev => prev.map(r => 
      r.Id === resource.Id 
        ? { ...r, downloadCount: r.downloadCount + 1 }
        : r
    ));
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "FileText";
      case "mp4":
      case "avi":
      case "mov":
        return "Video";
      case "docx":
      case "doc":
        return "File";
      case "html":
        return "Globe";
      case "png":
      case "jpg":
      case "jpeg":
        return "Image";
      default:
        return "Download";
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "Study Guide":
        return "primary";
      case "Video":
        return "purple";
      case "Interactive Content":
        return "success";
      case "Reference":
        return "info";
      case "Examples":
        return "warning";
      case "Diagram":
        return "danger";
      default:
        return "default";
    }
  };

  if (currentRole !== "student") {
    return <ErrorView error="Access denied. Only students can view resources." />;
  }

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadResources} />;

  const filteredResources = getFilteredResources();
  const types = getUniqueTypes();
  const subjects = getUniqueSubjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Learning Resources
        </h1>
        <p className="text-gray-600 mt-2">Access study materials, guides, and supplementary content</p>
      </div>

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
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{types.length}</p>
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
            className="w-full sm:w-48"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <Select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Empty 
          icon="BookOpen"
          title={searchTerm || filterType || filterSubject ? "No matching resources found" : "No resources available"}
          description={searchTerm || filterType || filterSubject ? "Try adjusting your search criteria" : "Check back later for new learning materials"}
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
                    </div>
                  </div>
                  <Badge variant={getTypeBadgeColor(resource.type)}>
                    {resource.type}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{resource.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{resource.fileType.toUpperCase()}</span>
                    <span>{resource.size}</span>
                  </div>
                  <div className="flex items-center">
                    <ApperIcon name="Download" className="h-3 w-3 mr-1" />
                    <span>{resource.downloadCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toast.info(`Previewing ${resource.title}`)}
                  >
                    <ApperIcon name="Eye" className="h-4 w-4 mr-1" />
                    Preview
                  </Button>

                  <Button 
                    variant="purple" 
                    size="sm"
                    onClick={() => handleDownload(resource)}
                  >
                    <ApperIcon name="Download" className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;