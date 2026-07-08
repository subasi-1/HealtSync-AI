import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-primary ${className}`}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary-color, #0f766e)" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {/* Outer Ring */}
      <circle cx="12" cy="12" r="10" stroke="url(#logo-grad)" strokeWidth="1.5" strokeOpacity="0.25" />
      {/* Pulse Network Line */}
      <path
        d="M3 12H6.5L8.5 7L11 17L13.5 10L15.5 13.5L17.5 12H21"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* AI Network Nodes */}
      <circle cx="8.5" cy="7" r="1.5" fill="#4f46e5" />
      <circle cx="11" cy="17" r="1.5" fill="#4f46e5" />
      <circle cx="13.5" cy="10" r="1.5" fill="#4f46e5" />
    </svg>
  );
};
