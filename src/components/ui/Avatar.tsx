import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  color?: "indigo" | "rose" | "amber" | "emerald" | "purple" | "cyan";
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = "indigo",
  size = "md",
  className = "",
  ...props
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeStyles = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  };

  const colorStyles = {
    indigo: "bg-indigo-100 text-indigo-700 ring-indigo-300",
    rose: "bg-rose-100 text-rose-700 ring-rose-300",
    amber: "bg-amber-100 text-amber-800 ring-amber-300",
    emerald: "bg-emerald-100 text-emerald-800 ring-emerald-300",
    purple: "bg-purple-100 text-purple-700 ring-purple-300",
    cyan: "bg-cyan-100 text-cyan-800 ring-cyan-300",
  };

  return (
    <div
      title={name}
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold shadow-xs ring-2 ring-white select-none ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      {...props}
    >
      {initials || "?"}
    </div>
  );
};
