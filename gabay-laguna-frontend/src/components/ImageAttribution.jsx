import React, { useState } from 'react';
import { IMAGE_ATTRIBUTIONS } from '../utils/imageUtils';

const ImageAttribution = ({ imageName, showFull = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const attribution = IMAGE_ATTRIBUTIONS[imageName];
  
  if (!attribution) {
    return null;
  }

  if (!showFull) {
    return (
      <div className="image-attribution-small">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          <button
            className="btn btn-link p-0 text-muted"
            style={{ fontSize: 'inherit', textDecoration: 'none' }}
            onClick={() => setShowDetails(!showDetails)}
            title="View image attribution"
          >
            Image Source
          </button>
        </small>
        
        {showDetails && (
          <div className="attribution-details mt-2 p-2 bg-light rounded">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>Source:</strong> {attribution.source}<br/>
                <strong>Author:</strong> {attribution.author}<br/>
                {attribution.license && (
                  <>
                    <strong>License:</strong> {attribution.license}<br/>
                  </>
                )}
                {attribution.url && (
                  <a 
                    href={attribution.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary mt-1"
                  >
                    <i className="fas fa-external-link-alt me-1"></i>
                    View Original
                  </a>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDetails(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="image-attribution-full">
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-copyright me-2"></i>
            Image Attribution
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Source:</strong> {attribution.source}</p>
              <p><strong>Author:</strong> {attribution.author}</p>
              {attribution.license && (
                <p><strong>License:</strong> {attribution.license}</p>
              )}
            </div>
            <div className="col-md-6">
              {attribution.url && (
                <a 
                  href={attribution.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  View Original Image
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAttribution;

