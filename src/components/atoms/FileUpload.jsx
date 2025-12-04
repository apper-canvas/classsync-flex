import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const FileUpload = ({ 
  onFilesChange, 
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  },
  maxSize = 10485760, // 10MB
  maxFiles = 5,
  className = '',
  disabled = false
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (disabled) return;

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = {};
      rejectedFiles.forEach((file, index) => {
        const error = file.errors[0];
        newErrors[`rejected-${index}`] = error.message;
      });
      setErrors(newErrors);
    }

    // Process accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));

      setFiles(prev => {
        const updated = [...prev, ...newFiles];
        onFilesChange?.(updated);
        return updated;
      });

      // Simulate upload progress
      newFiles.forEach(fileObj => {
        simulateUpload(fileObj.id);
      });
    }
  }, [disabled, onFilesChange]);

  const simulateUpload = (fileId) => {
    setUploading(prev => ({ ...prev, [fileId]: true }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploading(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }
      
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, progress } : file
      ));
    }, 200);
  };

  const removeFile = (fileId) => {
    if (disabled) return;
    
    setFiles(prev => {
      const updated = prev.filter(file => {
        if (file.id === fileId) {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
          return false;
        }
        return true;
      });
      onFilesChange?.(updated);
      return updated;
    });
    
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    if (type.includes('word')) return 'FileText';
    return 'File';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled
  });

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'file-upload-zone',
          isDragActive && 'active',
          hasErrors && 'error',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <ApperIcon 
              name="Upload" 
              size={48} 
              className={cn(
                'text-gray-400',
                isDragActive && 'text-primary-500',
                hasErrors && 'text-red-400'
              )}
            />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="space-y-2">
          {Object.entries(errors).map(([key, error]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <ApperIcon name="AlertCircle" size={16} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ApperIcon 
                    name={getFileIcon(file.type)} 
                    size={20} 
                    className="text-gray-500 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {uploading[file.id] && (
                      <div className="file-progress-bar mt-2">
                        <div 
                          className="file-progress-fill"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                  className="flex-shrink-0"
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { FileUpload };