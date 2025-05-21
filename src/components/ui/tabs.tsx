import React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = '', children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Clone children and pass the active tab state
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === TabsList) {
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, (trigger) => {
            if (React.isValidElement(trigger) && trigger.type === TabsTrigger) {
              return React.cloneElement(trigger, {
                active: trigger.props.value === activeTab,
                onClick: () => setActiveTab(trigger.props.value)
              });
            }
            return trigger;
          })
        });
      }
      
      if (child.type === TabsContent) {
        return React.cloneElement(child, {
          active: child.props.value === activeTab
        });
      }
    }
    return child;
  });

  return (
    <div className={`${className}`}>
      {childrenWithProps}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-md bg-beige-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  className = '', 
  children, 
  active = false,
  onClick
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${active 
          ? 'bg-white text-teal-600 shadow-sm' 
          : 'text-text-secondary hover:text-text-primary'
        } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  className = '', 
  children,
  active = false
}) => {
  if (!active) return null;
  
  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}; 