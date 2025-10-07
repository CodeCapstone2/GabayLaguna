import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ className = "", size = "md" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
        <button
      onClick={toggleTheme}
      className={`
        theme-toggle-btn
        ${sizeClasses[size]}
        ${className}
        relative
        rounded-full
        border-2
        transition-all
        duration-300
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-500
        hover:scale-110
        active:scale-95
        ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-400 text-white shadow-lg shadow-yellow-400/25"
        }
      `}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <FaSun
          className={`
            absolute
            transition-all
            duration-300
            ease-in-out
            ${
              isDarkMode
                ? "opacity-0 rotate-180 scale-0"
                : "opacity-100 rotate-0 scale-100"
            }
          `}
        />
        <FaMoon
          className={`
            absolute
            transition-all
            duration-300
            ease-in-out
            ${
              isDarkMode
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-180 scale-0"
            }
          `}
        />
          </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`
          absolute
          inset-0
          rounded-full
          transition-all
          duration-300
          ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-400 to-purple-400 opacity-0"
              : "bg-gradient-to-r from-yellow-300 to-orange-300 opacity-0"
          }
        `}
        />
      </div>
        </button>
  );
};

export default ThemeToggle;
