import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-none",
};

const Container = ({
  children,
  className = "",
  size = "lg",
}: ContainerProps) => {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
