import React from 'react';

const ShareButton = ({ 
  onClick, 
  size = 'medium', 
  variant = 'default',
  className = '',
  showText = true,
  title = 'Share'
}) => {
  const sizeClasses = {
    small: 'p-2 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const variantClasses = {
    default: 'text-slate-400 hover:text-slate-200 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30',
    primary: 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-500',
    minimal: 'text-slate-500 hover:text-slate-300'
  };

  const baseClasses = 'flex items-center gap-2 transition-all duration-200 rounded-lg flex-shrink-0';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      title={title}
    >
      <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      {showText && <span>Share</span>}
    </button>
  );
};

export default ShareButton;