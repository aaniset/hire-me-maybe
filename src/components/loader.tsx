// components/Loader.tsx
import React from "react";
import { Icons } from "@/components/icons"; // Adjust this import path as needed

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
``
  return (
    <div
      className={`${className} flex items-center justify-center bg-background/50`}
    >
      <Icons.spinner className={`animate-spin ${sizeClasses[size]} `} />
    </div>
    // <Icons.spinner
    //   className={`animate-spin  ${sizeClasses[size]} ${className}`}
    // />
  );
};

export default Loader;
