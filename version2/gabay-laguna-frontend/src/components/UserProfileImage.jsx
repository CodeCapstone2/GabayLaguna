import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const UserProfileImage = ({ 
  user, 
  onImageUpdate, 
  editable = false,
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { width: '60px', height: '60px', fontSize: '12px' };
      case 'medium':
        return { width: '100px', height: '100px', fontSize: '14px' };
      case 'large':
        return { width: '150px', height: '150px', fontSize: '16px' };
      default:
        return { width: '100px', height: '100px', fontSize: '14px' };
    }
  };

  const sizeClasses = getSizeClasses();

  const handleImageSelect = async (file, previewUrl) => {
    if (onImageUpdate) {
      try {
        // Here you would typically upload the file to your server
        // For now, we'll just use the preview URL
        await onImageUpdate(file, previewUrl);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-profile-image-container">
      {editable && isEditing ? (
        <div className="image-edit-mode">
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={user?.profile_image}
            type="user"
            className="mb-3"
          />
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() => setIsEditing(false)}
            >
              <i className="fas fa-check me-1"></i>
              Done
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              <i className="fas fa-times me-1"></i>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-image-display">
          <div
            className="profile-image"
            style={{
              width: sizeClasses.width,
              height: sizeClasses.height,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #ddd',
              position: 'relative',
              cursor: editable ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa'
            }}
            onClick={() => editable && setIsEditing(true)}
            title={editable ? 'Click to change profile picture' : ''}
          >
            {user?.profile_image ? (
              <img
                src={getImageUrl(user.name, 'user', user.profile_image)}
                alt={`${user.name || 'User'}'s profile`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => handleImageError(e, 'user')}
              />
            ) : (
              <div
                className="profile-initials"
                style={{
                  fontSize: sizeClasses.fontSize,
                  fontWeight: 'bold',
                  color: '#666',
                  textAlign: 'center'
                }}
              >
                {getInitials(user?.name || user?.email)}
              </div>
            )}
            
            {editable && (
              <div
                className="edit-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  borderRadius: '50%'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0'}
              >
                <i className="fas fa-camera text-white" style={{ fontSize: '20px' }}></i>
              </div>
            )}
          </div>
          
          {editable && (
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => setIsEditing(true)}
              style={{ fontSize: '12px' }}
            >
              <i className="fas fa-edit me-1"></i>
              Change Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileImage;
