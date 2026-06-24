import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-darkgrey/80 dark:text-beige-light/85">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 bg-white dark:bg-darkgrey-dark dark:border-darkgrey-light text-darkgrey dark:text-beige-light placeholder-darkgrey/40 dark:placeholder-beige-dark/40 focus:ring-2 focus:ring-beige-dark dark:focus:ring-beige outline-none transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
export { Input };
