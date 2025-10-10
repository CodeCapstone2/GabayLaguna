// Image utility functions for handling location and user images

// Default images for locations
export const DEFAULT_IMAGES = {
  // Cities
  'Pagsanjan': '/assets/spots/pagsanjan-falls.svg',
  'Sta. Rosa': '/assets/spots/enchanted-kingdom.svg', 
  'Lumban': '/assets/spots/lake-caliraya.svg',
  'Calamba': '/assets/spots/rizalshrine.jpg',
  'San Pablo': '/assets/spots/seven-lakes.svg',
  'Los Baños': '/assets/spots/up-losbanos.svg',
  
  // POIs
  'Pagsanjan Falls': '/assets/spots/pagsanjan-falls.svg',
  'Pagsanjan Arch': '/assets/spots/pagsanjan-arch.svg',
  'Enchanted Kingdom': '/assets/spots/enchanted-kingdom.svg',
  'Sta. Rosa City Hall': '/assets/spots/sta-rosa-cityhall.svg',
  'Lake Caliraya': '/assets/spots/lake-caliraya.svg',
  'Lumban Church': '/assets/spots/lumban-church.svg',
  'Rizal Shrine': '/assets/spots/rizalshrine.jpg',
  'Calamba Church': '/assets/spots/calambachurch.jpg',
  'Mount Makiling': '/assets/spots/mount-makiling.svg',
  'Seven Lakes of San Pablo': '/assets/spots/seven-lakes.svg',
  'San Pablo Cathedral': '/assets/spots/sanpablo-cathedral.svg',
  'UP Los Baños': '/assets/spots/up-losbanos.svg',
  'Los Baños Hot Springs': '/assets/spots/losbanos-hotsprings.svg',
  'Liliw Church': '/assets/spots/liliw-church.svg',
  'Paete Woodcarving Shops': '/assets/spots/paete-woodcarving.svg',
  'Majayjay Church': '/assets/spots/majayjay-church.svg',
  'Majayjay Falls': '/assets/spots/majayjay-falls.svg',
  'Pangil River': '/assets/spots/pangil-river.svg',
  'Luisiana Scenic Views': '/assets/spots/luisiana-views.svg',
  'Calauan Nature Park': '/assets/spots/calauan-park.svg',
  'Nagcarlan Underground Cemetery': '/assets/spots/nagcarlan-cemetery.svg',
  'Nagcarlan Falls': '/assets/spots/nagcarlan-falls.svg',
  'Pila Heritage Town': '/assets/spots/pila-heritage.svg'
};

// Fallback images
export const FALLBACK_IMAGES = {
  city: '/assets/default-city.svg',
  poi: '/assets/default-poi.svg',
  user: '/assets/default-user.svg',
  guide: '/assets/guides/default-guide.svg'
};

// Image attribution information
export const IMAGE_ATTRIBUTIONS = {
  'pagsanjan-falls.jpg': {
    source: 'Wikimedia Commons',
    author: 'Public Domain',
    url: 'https://commons.wikimedia.org/wiki/File:Pagsanjan_Falls.jpg',
    license: 'Public Domain'
  },
  'enchanted-kingdom.jpg': {
    source: 'Enchanted Kingdom Official',
    author: 'Enchanted Kingdom',
    url: 'https://www.enchantedkingdom.ph/',
    license: 'Fair Use - Tourism Promotion'
  },
  'lake-caliraya.jpg': {
    source: 'Tourism Philippines',
    author: 'Department of Tourism',
    url: 'https://www.tourism.gov.ph/',
    license: 'Government Use'
  },
  'rizalshrine.jpg': {
    source: 'National Historical Commission',
    author: 'NHCP',
    url: 'https://nhcp.gov.ph/',
    license: 'Government Use'
  }
};

/**
 * Get the appropriate image URL for a location or POI
 * @param {string} name - Name of the location or POI
 * @param {string} type - Type of image ('city', 'poi', 'user', 'guide')
 * @param {string} customImage - Custom image URL if provided
 * @returns {string} Image URL
 */
export const getImageUrl = (name, type = 'poi', customImage = null) => {
  // If custom image is provided and valid, use it
  if (customImage && customImage.trim() !== '') {
    return customImage;
  }
  
  // Try to get from default images
  const defaultImage = DEFAULT_IMAGES[name];
  if (defaultImage) {
    return defaultImage;
  }
  
  // Fallback to type-specific default
  return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.poi;
};

/**
 * Handle image loading errors by setting fallback image
 * @param {Event} event - Image error event
 * @param {string} fallbackType - Type of fallback image
 */
export const handleImageError = (event, fallbackType = 'poi') => {
  const fallbackUrl = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.poi;
  if (event.target.src !== fallbackUrl) {
    event.target.src = fallbackUrl;
  }
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size too large. Please upload images smaller than 5MB.' };
  }
  
  return { isValid: true, message: 'Valid image file' };
};

/**
 * Create a data URL from a file for preview
 * @param {File} file - Image file
 * @returns {Promise<string>} Data URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Resize image to specified dimensions
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<Blob>} Resized image blob
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
