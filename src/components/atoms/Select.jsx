import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  children,
  error,
  ...props 
}, ref) => {
  const baseStyles = "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";
  
  const errorStyles = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  return (
    <select
      className={cn(baseStyles, errorStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;