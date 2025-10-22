import React from 'react';

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  showLabel = true, 
  size = 'normal',
  interactive = false,
  onRatingChange = null 
}) => {
  // Debug logging
  console.log('StarRating props:', { rating, maxRating, showLabel, size, interactive });
  
  // Function to get rating label and color
  const getRatingInfo = (rating) => {
    if (rating >= 4.5) {
      return { label: 'Excellent', color: 'success', bgColor: 'bg-success' };
    } else if (rating >= 3.5) {
      return { label: 'Good', color: 'info', bgColor: 'bg-info' };
    } else if (rating >= 2.5) {
      return { label: 'Average', color: 'warning', bgColor: 'bg-warning' };
    } else if (rating >= 1.5) {
      return { label: 'Poor', color: 'danger', bgColor: 'bg-danger' };
    } else {
      return { label: 'Very Poor', color: 'danger', bgColor: 'bg-danger' };
    }
  };

  const ratingInfo = getRatingInfo(rating);
  const sizeClass = size === 'large' ? 'fs-4' : size === 'small' ? 'fs-6' : 'fs-5';

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="d-flex align-items-center">
      {/* Star Display */}
      <div className={`${sizeClass} me-2`} style={{ minHeight: '30px' }}>
        {Array.from({ length: maxRating }, (_, i) => (
          <span
            key={i}
            className={`${
              i < rating ? "text-warning" : "text-muted"
            }`}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              marginRight: '4px',
              fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '1rem' : '1.25rem',
              display: 'inline-block',
              userSelect: 'none'
            }}
            onClick={() => {
              console.log('Star clicked:', i + 1);
              handleStarClick(i + 1);
            }}
            title={`${i + 1} star${i > 0 ? 's' : ''}`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Rating Number */}
      <span className={`fw-bold me-2 ${sizeClass}`}>
        {rating.toFixed(1)}
      </span>

      {/* Rating Label */}
      {showLabel && (
        <span className={`badge ${ratingInfo.bgColor} text-white ${size === 'small' ? 'fs-6' : 'fs-6'}`}>
          {ratingInfo.label}
        </span>
      )}
    </div>
  );
};

export default StarRating;
