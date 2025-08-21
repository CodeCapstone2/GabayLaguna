import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon, FaPalette, FaCheck } from 'react-icons/fa';

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [dark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keyboard shortcut listener - simplified and safe
  useEffect(() => {
    // Keyboard shortcut temporarily removed to prevent errors
    // Will be re-implemented with better error handling in future update
  }, [dark]);

  const handleThemeToggle = () => {
    setIsAnimating(true);
    setDark(!dark);
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <>
      <div className="theme-toggle-container position-relative">
        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className={`btn theme-toggle-btn d-flex align-items-center justify-content-center gap-2 px-3 py-2 ${
            isAnimating ? 'animating' : ''
          }`}
          style={{
            borderRadius: '25px',
            border: 'none',
            background: dark 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            color: dark ? '#ffffff' : '#1e293b',
            fontWeight: '600',
            boxShadow: dark 
              ? '0 4px 15px rgba(102, 126, 234, 0.3)'
              : '0 4px 15px rgba(251, 191, 36, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: '120px',
            maxWidth: '140px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (!isAnimating) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = dark 
                ? '0 6px 20px rgba(102, 126, 234, 0.4)'
                : '0 6px 20px rgba(251, 191, 36, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAnimating) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = dark 
                ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                : '0 4px 15px rgba(251, 191, 36, 0.3)';
            }
          }}
          disabled={isAnimating}
          aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
          title={`Press T to toggle theme (currently ${dark ? 'dark' : 'light'})`}
        >
          {/* Icon with smooth transition */}
          <div 
            className="theme-icon-container"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isAnimating ? 'rotate(180deg) scale(1.2)' : 'rotate(0deg) scale(1)'
            }}
          >
            {dark ? (
              <FaSun size={18} />
            ) : (
              <FaMoon size={18} />
            )}
          </div>

          {/* Text with smooth transition - hidden on small screens */}
          <span 
            className="theme-text d-none d-sm-inline"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isAnimating ? 0 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {dark ? 'Light' : 'Dark'}
          </span>

          {/* Ripple effect background */}
          <div 
            className="theme-ripple"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '0',
              height: '0',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isAnimating ? 1 : 0
            }}
          />
        </button>

        {/* Theme Indicator - hidden on small screens */}
        <div 
          className="theme-indicator position-absolute top-100 start-50 translate-middle-x mt-2 d-none d-md-block"
          style={{
            fontSize: '0.75rem',
            color: dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
            fontWeight: '500',
            textAlign: 'center',
            transition: 'color 0.3s ease',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <FaPalette size={12} className="me-1" />
          {dark ? 'Dark Theme' : 'Light Theme'}
        </div>

        {/* Keyboard shortcut hint - hidden on small screens */}
        <div 
          className="theme-shortcut position-absolute top-100 start-50 translate-middle-x mt-4 d-none d-lg-block"
          style={{
            fontSize: '0.65rem',
            color: dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 41, 59, 0.5)',
            textAlign: 'center',
            transition: 'color 0.3s ease',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          Press <kbd style={{
            background: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.1)',
            border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.2)'}`,
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.6rem'
          }}>T</kbd> to toggle
        </div>
      </div>

      {/* Theme Change Notification */}
      {showNotification && (
        <div 
          className="theme-notification position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 shadow-lg"
          style={{
            background: dark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: dark ? '#ffffff' : '#1e293b',
            border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.2)'}`,
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            animation: 'slide-down 0.3s ease-out',
            maxWidth: '90vw',
            overflow: 'hidden'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FaCheck size={16} className="text-success" />
            <span className="fw-semibold">
              Switched to {dark ? 'Dark' : 'Light'} Theme
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeToggle;
