import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default, success, warning, danger, purple, cyan
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-800/80',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80',
  };

  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    purple: 'bg-purple-400',
    cyan: 'bg-cyan-400',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant] || dotColors.default}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
