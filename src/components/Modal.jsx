import React from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, onClose, title, maxWidth = "max-w-md" }) {
  // Add blur effect to main content when modal is open
  React.useEffect(() => {
    const body = document.body;
    const root = document.getElementById('root') || document.querySelector('[data-reactroot]');
    
    // Prevent body scroll
    body.style.overflow = 'hidden';
    
    // Add blur to the main app content only
    if (root) {
      root.style.filter = 'blur(8px)';
      root.style.transition = 'filter 0.3s ease-out';
    }
    
    return () => {
      // Remove blur and restore scroll when modal closes
      body.style.overflow = '';
      if (root) {
        root.style.filter = '';
      }
    };
  }, []);

  // Create modal content
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className={`bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full ${maxWidth} border border-white/20 shadow-2xl relative animate-in fade-in-0 zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors p-1 z-10 rounded-full hover:bg-gray-200/50"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Optional title */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pr-8">
            {title}
          </h3>
        )}
        
        {/* Modal content */}
        <div className={title ? "" : "pt-2"}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal using React Portal to escape the blurred root
  return createPortal(modalContent, document.body);
}