// src/components/ui/select.tsx
import * as React from 'react';

// Select Context
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: React.ReactElement[]; // Add options to context
}
const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

// Select Component
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode; // Should contain SelectTrigger and SelectContent
  disabled?: boolean;
}

function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const [options, setOptions] = React.useState<React.ReactElement[]>([]);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    // Extract SelectItem components from children for rendering native options
    const selectContentChild = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && (child.type as any).displayName === 'SelectContent'
    );

    if (selectContentChild && React.isValidElement(selectContentChild)) {
      const selectItems = React.Children.toArray((selectContentChild.props as any).children).filter(
        (child) => React.isValidElement(child) && (child.type as any).displayName === 'SelectItem'
      ) as React.ReactElement[];
      setOptions(selectItems);
    }
  }, [children]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  const handleTriggerClick = () => {
    // Programmatically open the native select dropdown
    if (selectRef.current && !disabled) {
      selectRef.current.focus(); // Focus to open the dropdown
      // For some browsers, a click might be needed if focus doesn't open it
      // selectRef.current.click();
    }
  };


  return (
    <SelectContext.Provider value={{ value: localValue, onValueChange, disabled, options }}>
      <div className="relative inline-block w-full" onClick={handleTriggerClick}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && (child.type as any).displayName === 'SelectTrigger') {
            return React.cloneElement(child, { disabled: disabled }); // Pass disabled to trigger
          }
          return null; // Don't render SelectContent here
        })}
        <select
          ref={selectRef}
          value={localValue}
          onChange={handleChange}
          className="absolute inset-0 appearance-none bg-transparent w-full h-full cursor-pointer opacity-0 z-10"
          disabled={disabled}
          aria-hidden="true" // Hide from screen readers, as SelectTrigger provides accessibility
        >
          {options.map(item => (
            <option key={item.props.value} value={item.props.value} disabled={item.props.disabled}>
              {item.props.children}
            </option>
          ))}
        </select>
      </div>
    </SelectContext.Provider>
  );
}

// SelectTrigger Component
interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode; // Should contain SelectValue
  disabled?: boolean; // Added disabled prop
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectTrigger must be used within a Select component");

    let displayedValue: React.ReactNode = '';
    const selectValueChild = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && (child.type as any).displayName === 'SelectValue'
    ) as React.ReactElement | undefined;

    // Prioritize context.value, then SelectValue's placeholder
    if (context.value && context.value !== '') {
        // Find the actual children of the selected option from context.options
        const selectedOption = context.options.find(opt => opt.props.value === context.value);
        displayedValue = selectedOption ? selectedOption.props.children : context.value;
    } else if (selectValueChild && selectValueChild.props.placeholder) {
        displayedValue = selectValueChild.props.placeholder;
    } else if (selectValueChild && selectValueChild.props.children) { // Fallback to SelectValue's children if no value and no placeholder
        displayedValue = selectValueChild.props.children;
    }


    return (
      <div
        ref={ref}
        className={`flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className || ''}`}
        {...props}
      >
        <span className="truncate">{displayedValue}</span> {/* Wrapped displayedValue */}
        <svg // Chevron icon
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 opacity-50"
        >
          <path d="M6 9l6 6l6-6" />
        </svg>
      </div>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

// SelectValue Component
interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode; // Content inside SelectValue is typically the actual value element
  placeholder?: string;
}

function SelectValue({ className, children, placeholder, ...props }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within a Select component");

  // If a child is provided, render it. Otherwise, use the context value.
  const displayContent = children ? children : context.value;

  return (
    <span className={className} {...props}>
      {displayContent || placeholder}
    </span>
  );
}
SelectValue.displayName = 'SelectValue';


// SelectContent Component
interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode; // Should contain SelectItem components
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    // SelectContent now just provides its children (SelectItems) which will be transformed into native <option>s by the main Select component.
    // It should not render itself as hidden.
    return <>{children}</>; // Render children directly, main Select will process them
  }
);
SelectContent.displayName = 'SelectContent';

// SelectItem Component
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  value: string;
  children: React.ReactNode;
  disabled?: boolean; // Added disabled prop
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    // SelectItem now just acts as a container for data that will be used to render native <option>
    return <>{children}</>;
  }
);
SelectItem.displayName = 'SelectItem';


export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };