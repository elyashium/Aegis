import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  className = '',
}) => {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-beige-100 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-teal-600 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}; 