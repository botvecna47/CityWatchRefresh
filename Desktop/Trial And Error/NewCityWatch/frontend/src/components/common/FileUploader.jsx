import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { uploadService } from '../../services/upload.service';
import { Spinner } from './Spinner';
import './FileUploader.css';

const FileUploader = ({ onUploadComplete, maxFiles = 3, existingFiles = [] }) => {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    setUploading(true);
    setError(null);

    const newFiles = [];
    
    for (const file of acceptedFiles) {
      try {
        const response = await uploadService.uploadFile(file);
        if (response.data.success) {
          newFiles.push(response.data.data);
        }
      } catch (err) {
        console.error('Upload failed', err);
        setError('Failed to upload one or more files. Please try again.');
        // If one fails, we stop? Or continue? Let's continue but show error.
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
    onUploadComplete([...files, ...newFiles]); // Notify parent
  }, [files, maxFiles, onUploadComplete]);

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onUploadComplete(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'], 
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || files.length >= maxFiles
  });

  return (
    <div className="file-uploader">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${files.length >= maxFiles ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="uploading-state">
            <Spinner size="medium" />
            <p>Uploading evidence...</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <Upload className="upload-icon" />
            <p className="upload-text">
              {isDragActive ? "Drop files here..." : "Drag & drop evidence here, or click to select"}
            </p>
            <span className="upload-hint">max {maxFiles} files (Images/Video, 10MB max)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <div className="file-info">
                {file.mimetype.startsWith('image') ? (
                  // Assuming setupProxy or CORS allows accessing uploads directly or via proxy
                   // For MVP local dev, we might need full URL if not proxied. 
                   // Backend returns /uploads/filename. Relative path works if valid.
                  <img src={`http://localhost:5000${file.url}`} alt="preview" className="file-preview-img" /> 
                ) : (
                  <File className="file-icon" />
                )}
                <div className="file-details">
                  <span className="file-name">{file.originalName || file.filename}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <button onClick={() => removeFile(index)} className="remove-btn" type="button">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
