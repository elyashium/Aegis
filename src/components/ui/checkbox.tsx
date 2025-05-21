import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  checked?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  className = '',
  ...props
}) => {
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        className="peer absolute h-4 w-4 opacity-0"
        {...props}
      />
      <div
        className={`h-4 w-4 rounded border border-beige-300 flex items-center justify-center 
          peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 peer-focus-visible:ring-offset-2 
          ${checked ? 'bg-teal-600 border-teal-600' : 'bg-white'} ${className}`}
      >
        {checked && <Check className="h-3 w-3 text-white stroke-[3]" />}
      </div>
    </div>
  );
}; 