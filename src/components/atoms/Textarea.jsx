import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(({ 
  className, 
  error,
  ...props 
}, ref) => {
  const baseStyles = "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 focus-ring placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical";
  
  const errorStyles = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  return (
    <textarea
      className={cn(baseStyles, errorStyles, className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;