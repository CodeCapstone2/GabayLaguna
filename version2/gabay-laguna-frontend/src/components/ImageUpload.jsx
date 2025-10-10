import React, { useState, useRef } from 'react';
import { validateImageFile, createImagePreview, resizeImage } from '../utils/imageUtils';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage = null, 
  type = 'user', // 'user', 'poi', 'city'
  maxSize = 5 * 1024 * 1024, // 5MB
  maxWidth = 800,
  maxHeight = 600,
  className = '',
  disabled = false
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.message);
        setUploading(false);
        return;
      }

      // Create preview
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);

      // Resize image if needed
      const resizedFile = await resizeImage(file, maxWidth, maxHeight);
      
      // Call parent callback with the processed file
      if (onImageSelect) {
        onImageSelect(resizedFile, previewUrl);
      }

    } catch (err) {
      setError('Error processing image. Please try again.');
      console.error('Image processing error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null, null);
    }
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'user':
        return 'Upload Profile Picture';
      case 'poi':
        return 'Upload POI Image';
      case 'city':
        return 'Upload City Image';
      default:
        return 'Upload Image';
    }
  };

  const getImageDimensions = () => {
    switch (type) {
      case 'user':
        return { width: 150, height: 150 };
      case 'poi':
        return { width: 300, height: 200 };
      case 'city':
        return { width: 400, height: 250 };
      default:
        return { width: 300, height: 200 };
    }
  };

  const dimensions = getImageDimensions();

  return (
    <div className={`image-upload-container ${className}`}>
      <div className="image-upload-area">
        {preview ? (
          <div className="image-preview-container">
            <img
              src={preview}
              alt="Preview"
              className="image-preview"
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                objectFit: 'cover',
                borderRadius: type === 'user' ? '50%' : '8px',
                border: '2px solid #ddd'
              }}
            />
            <div className="image-overlay">
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRemoveImage}
                disabled={disabled}
                title="Remove image"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="image-upload-placeholder"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              border: '2px dashed #ccc',
              borderRadius: type === 'user' ? '50%' : '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: '#f8f9fa',
              opacity: disabled ? 0.6 : 1
            }}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <i className="fas fa-camera fa-2x text-muted mb-2"></i>
            <span className="text-muted small text-center">
              {getPlaceholderText()}
            </span>
            <span className="text-muted small">
              Max {Math.round(maxSize / (1024 * 1024))}MB
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {!preview && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-upload me-2"></i>
              Choose Image
            </>
          )}
        </button>
      )}

      {error && (
        <div className="alert alert-danger mt-2" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="image-upload-info mt-2">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Supported formats: JPEG, PNG, GIF, WebP
        </small>
      </div>
    </div>
  );
};

export default ImageUpload;

