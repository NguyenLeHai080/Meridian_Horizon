import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, success, outline, ghost, danger
  size = 'md', // sm, md, lg
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/30 focus:ring-purple-500 border border-purple-500/30',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/30 focus:ring-emerald-500 border border-emerald-500/30',
    outline: 'border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white bg-transparent hover:bg-gray-800/60 focus:ring-gray-400',
    ghost: 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 focus:ring-gray-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-950/30 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
