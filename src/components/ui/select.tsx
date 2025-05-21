import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder: string;
  className?: string;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  // Clone children and pass the necessary props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === SelectTrigger) {
        return React.cloneElement(child, {
          onClick: () => setOpen(!open),
        });
      }
      
      if (child.type === SelectContent) {
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${open ? '' : 'hidden'}`,
          children: React.Children.map(child.props.children, (item) => {
            if (React.isValidElement(item) && item.type === SelectItem) {
              return React.cloneElement(item, {
                onClick: () => {
                  onValueChange(item.props.value);
                  setOpen(false);
                },
              });
            }
            return item;
          }),
        });
      }
    }
    return child;
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {childrenWithProps}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  id,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      id={id}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-beige-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  className = '',
}) => {
  return (
    <span className={`block truncate ${className}`}>
      {placeholder}
    </span>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`absolute top-full mt-1 w-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-beige-200 bg-white text-text-primary shadow-md ${className}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  className = '',
  children,
  onClick,
}) => {
  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-beige-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={onClick}
    >
      <span className="block truncate">{children}</span>
    </div>
  );
}; 