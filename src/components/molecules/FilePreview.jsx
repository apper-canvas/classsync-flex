import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const FilePreview = ({ file, onRemove, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!file) return null;

  const { name, type, size, preview } = file;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (type.startsWith('image/') && preview && !imageError) {
      return (
        <img 
          src={preview} 
          alt={name}
          className="file-preview-image"
          onError={() => setImageError(true)}
        />
      );
    }

    if (type === 'application/pdf') {
      return (
        <div className="file-preview-pdf">
          <div className="text-center space-y-2">
            <ApperIcon name="FileText" size={48} className="text-red-600 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">PDF Document</p>
              <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="file-preview-default">
        <div className="text-center space-y-2">
          <ApperIcon 
            name={type.includes('word') ? 'FileText' : 'File'} 
            size={48} 
            className="text-gray-400 mx-auto" 
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {type.includes('word') ? 'Document' : 'File'}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="file-preview-container">
        {renderPreview()}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-sm"
          >
            <ApperIcon name="X" size={16} />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900 truncate" title={name}>
          {name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(size)} • {type}
        </p>
      </div>
    </div>
  );
};

export { FilePreview };