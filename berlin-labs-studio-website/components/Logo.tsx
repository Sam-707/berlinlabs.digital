import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* The Aperture: A frame that encloses focus but remains open to growth */}
      <path 
        d="M20 14V4H4V20H14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="square"
        strokeLinejoin="inherit"
      />
      {/* The Center Point: A subtle hint of the product/focus within */}
      <rect x="10" y="10" width="4" height="4" fill="currentColor" className="opacity-20" />
    </svg>
  );
};
