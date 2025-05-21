import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  asChild = false,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-beige-300 bg-transparent hover:bg-beige-50 text-text-primary';
      case 'ghost':
        return 'bg-transparent hover:bg-beige-50 text-text-primary';
      case 'link':
        return 'bg-transparent underline-offset-4 hover:underline text-teal-600';
      default:
        return 'bg-teal-600 text-white hover:bg-teal-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 rounded-md px-3 text-xs';
      case 'lg':
        return 'h-11 rounded-md px-8 text-base';
      case 'icon':
        return 'h-9 w-9 rounded-md';
      default:
        return 'h-10 rounded-md px-4 py-2 text-sm';
    }
  };

  const Comp = asChild ? React.Children.only(children) : 'button';
  
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      className: `inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${getVariantClasses()} ${getSizeClasses()} ${className}`,
      ...props
    });
  }

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 