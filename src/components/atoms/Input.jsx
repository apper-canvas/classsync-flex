import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className, 
  type = "text",
  error,
  ...props 
}, ref) => {
  const baseStyles = "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 focus-ring placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50";
  
  const errorStyles = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  return (
    <input
      type={type}
      className={cn(baseStyles, errorStyles, className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;