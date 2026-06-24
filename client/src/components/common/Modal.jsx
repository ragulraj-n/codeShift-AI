import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-darkgrey/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${sizeClasses[size] || 'max-w-md'} transform overflow-hidden rounded-2xl border border-beige-dark/20 bg-beige-light dark:bg-darkgrey dark:border-darkgrey-light p-6 shadow-2xl transition-all duration-300 scale-100 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-beige-dark/30 dark:border-darkgrey-light pb-4 mb-4">
          <h3 className="text-xl font-bold tracking-wide text-darkgrey dark:text-beige-light">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-darkgrey/60 hover:bg-beige/40 dark:text-beige-dark dark:hover:bg-darkgrey-light/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
