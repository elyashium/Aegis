import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({
  className = '',
  orientation = 'horizontal',
}) => {
  return (
    <div
      className={`shrink-0 bg-beige-200 ${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
    />
  );
}; 