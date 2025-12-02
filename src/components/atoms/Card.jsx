import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  children,
  hover = false,
  ...props 
}, ref) => {
  const baseStyles = "rounded-xl border border-gray-200 bg-white shadow-card";
  const hoverStyles = hover ? "hover:shadow-card-hover transition-shadow duration-200" : "";

  return (
    <div
      ref={ref}
      className={cn(baseStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;