"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  size?: "sm" | "default" | "lg";
}

export function Toggle({
  className,
  size = "default",
  ...props
}: ToggleProps) {
  const sizeClasses = {
    sm: "h-8 px-2",
    default: "h-9 px-3",
    lg: "h-10 px-3",
  };

  return (
    <TogglePrimitive.Root
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "hover:bg-muted hover:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
} 