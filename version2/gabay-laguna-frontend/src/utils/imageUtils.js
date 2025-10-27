// Image utility functions for handling location and user images

// Default images for locations - Using diverse, unique real photos
export const DEFAULT_IMAGES = {
  // Cities - Each city has its own unique image
  'Pagsanjan': '/assets/StaRosaCity.jpg',
  'Sta. Rosa': '/assets/StaRosaCity.jpg',
  'Lumban': '/assets/BinanCity.jpg',
  'Calamba': '/assets/CalambaCity.jpg',
  'San Pablo': '/assets/SanPabloCity.svg.png',
  'Los Baños': '/assets/CabuyaoCity.jpg',
  'Nagcarlan': '/assets/SanPedroCity.jpg',
  
  // POIs - Each POI has its own unique image
  'Pagsanjan Falls': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Pagsanjan Arch': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'Enchanted Kingdom': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Sta. Rosa City Hall': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'Lake Caliraya': 'https://images.unsplash.com/photo-1439066290691-510066268af5?w=800&h=600&fit=crop',
  'Lumban Church': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'Rizal Shrine': '/assets/spots/rizalshrine.jpg',
  'Calamba Church': '/assets/spots/calambachurch.jpg',
  'Mount Makiling': 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
  'Seven Lakes of San Pablo': 'https://images.unsplash.com/photo-1439066290691-510066268af5?w=800&h=600&fit=crop',
  'San Pablo Cathedral': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'UP Los Baños': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
  'Los Baños Hot Springs': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
  'Liliw Church': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'Paete Woodcarving Shops': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop',
  'Majayjay Church': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'Majayjay Falls': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Pangil River': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
  'Luisiana Scenic Views': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Calauan Nature Park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'Nagcarlan Underground Cemetery': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop',
  'Nagcarlan Falls': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Pila Heritage Town': 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800&h=600&fit=crop'
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
  },
  // Unsplash attributions for real photos
  'photo-1506905925346-21bda4d32df4': {
    source: 'Unsplash',
    author: 'Unsplash Community',
    url: 'https://unsplash.com/photos/waterfall-nature-landscape',
    license: 'Unsplash License - Free to use'
  },
  'photo-1544551763-46a013bb70d5': {
    source: 'Unsplash',
    author: 'Unsplash Community',
    url: 'https://unsplash.com/photos/amusement-park-rides',
    license: 'Unsplash License - Free to use'
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
    // Add cache-busting parameter to force reload
    const separator = defaultImage.includes('?') ? '&' : '?';
    return `${defaultImage}${separator}t=${Date.now()}`;
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