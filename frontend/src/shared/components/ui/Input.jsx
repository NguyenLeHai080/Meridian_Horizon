import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#161f30] border ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-700/80 focus:border-purple-500 focus:ring-purple-500'
          } rounded-lg text-sm text-gray-100 placeholder-gray-500 transition-colors py-2 px-3 ${
            icon ? 'pl-9' : ''
          } focus:outline-none focus:ring-1 ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
