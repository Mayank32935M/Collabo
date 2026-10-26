import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "indigo" | "rose" | "amber" | "emerald" | "slate";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "indigo",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full border";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const variantStyles = {
    indigo: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
    rose: "bg-rose-50 border-rose-200/80 text-rose-700",
    amber: "bg-amber-50 border-amber-200/80 text-amber-800",
    emerald: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
    slate: "bg-slate-100 border-slate-200 text-slate-700",
    purple: "bg-purple-50 border-purple-200/80 text-purple-700"
  };

  const dotColors = {
    indigo: "bg-indigo-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-500",
    purple: "bg-purple-500"
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
