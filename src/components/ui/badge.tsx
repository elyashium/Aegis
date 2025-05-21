import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-beige-200 bg-white text-text-primary';
      default:
        return 'bg-teal-600 text-white';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getVariantClasses()} ${className}`}
    >
      {children}
    </span>
  );
}; 