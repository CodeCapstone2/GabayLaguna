import React, { useState } from 'react';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import ImageUpload from '../components/ImageUpload';
import UserProfileImage from '../components/UserProfileImage';
import ImageAttribution from '../components/ImageAttribution';

const ImageDemo = () => {
  const [demoUser, setDemoUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    profile_image: null
  });

  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpdate = async (file, previewUrl) => {
    console.log('Image updated:', file, previewUrl);
    setDemoUser(prev => ({ ...prev, profile_image: previewUrl }));
  };

  const handleImageSelect = (file, previewUrl) => {
    console.log('Image selected:', file, previewUrl);
    setUploadedImage(previewUrl);
  };

  const sampleLocations = [
    { name: 'Pagsanjan Falls', type: 'poi' },
    { name: 'Enchanted Kingdom', type: 'poi' },
    { name: 'Lake Caliraya', type: 'poi' },
    { name: 'Pagsanjan', type: 'city' },
    { name: 'Sta. Rosa', type: 'city' },
    { name: 'Lumban', type: 'city' }
  ];

  return (
    <div className="container py-5">
      <h1 className="mb-4">Image Management System Demo</h1>
      
      <div className="row">
        <div className="col-md-6">
          <h3>Location Images</h3>
          <p>These images now display properly with fallback placeholders:</p>
          
          <div className="row">
            {sampleLocations.map((location, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card">
                  <img
                    src={getImageUrl(location.name, location.type)}
                    className="card-img-top"
                    alt={location.name}
                    style={{ height: '150px', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, location.type)}
                  />
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1">{location.name}</h6>
                    <small className="text-muted">{location.type.toUpperCase()}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <h3>User Profile Image</h3>
          <p>Users can now upload their profile pictures:</p>
          
          <div className="d-flex justify-content-center mb-4">
            <UserProfileImage
              user={demoUser}
              onImageUpdate={handleImageUpdate}
              editable={true}
              size="large"
            />
          </div>

          <h4>Image Upload Component</h4>
          <p>Standalone image upload functionality:</p>
          
          <ImageUpload
            onImageSelect={handleImageSelect}
            type="poi"
            className="mb-3"
          />

          {uploadedImage && (
            <div className="mt-3">
              <h5>Uploaded Image Preview:</h5>
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="img-fluid rounded"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h3>Image Attribution</h3>
          <p>Proper attribution for images:</p>
          
          <ImageAttribution 
            imageName="pagsanjan-falls.jpg" 
            showFull={true}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-success">
            <h5><i className="fas fa-check-circle me-2"></i>Problem Solved!</h5>
            <ul className="mb-0">
              <li>✅ Location images now display properly with colorful placeholders</li>
              <li>✅ Users can upload their profile pictures</li>
              <li>✅ Proper image attribution system implemented</li>
              <li>✅ Fallback system ensures no blank images</li>
              <li>✅ Image validation and error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDemo;

