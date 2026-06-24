import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-wide rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    // Premium theme utilizing Beige (#DDD0C8) & Dark Grey (#323232)
    primary: 'bg-darkgrey text-beige-light hover:bg-darkgrey-light focus:ring-darkgrey dark:bg-beige dark:text-darkgrey-dark dark:hover:bg-beige-dark dark:focus:ring-beige',
    secondary: 'bg-beige text-darkgrey-dark hover:bg-beige-dark focus:ring-beige-dark dark:bg-darkgrey-light dark:text-beige-light dark:hover:bg-darkgrey-light/80 dark:focus:ring-darkgrey-light',
    outline: 'border border-beige-dark text-darkgrey hover:bg-beige-light focus:ring-beige-dark dark:border-darkgrey-light dark:text-beige-light dark:hover:bg-darkgrey-light/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
export { Button };
