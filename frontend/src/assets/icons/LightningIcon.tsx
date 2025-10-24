import React from "react";

interface IconProps {
  className?: string;
}

export const LightningIcon: React.FC<IconProps> = ({
  className = "w-8 h-8",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);
