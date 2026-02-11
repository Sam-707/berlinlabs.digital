import React from 'react';

interface BrandLogoProps {
  className?: string;
  withText?: boolean;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "w-8 h-8", 
  withText = false,
  theme = 'light' 
}) => {
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon: A stylized document transforming into a chat bubble with a spark */}
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-brand-600">
        {/* Background Shape (Soft Square) */}
        <rect x="10" y="10" width="80" height="80" rx="20" fill="currentColor" fillOpacity="0.1" />
        
        {/* Document Shape */}
        <path d="M35 25H65C70.5228 25 75 29.4772 75 35V65C75 70.5228 70.5228 75 65 75H35C29.4772 75 25 70.5228 25 65V35C25 29.4772 29.4772 25 35 25Z" fill="currentColor" />
        
        {/* The "AI Spark" / Lightning Cutout */}
        <path d="M50 35L54 46L65 50L54 54L50 65L46 54L35 50L46 46L50 35Z" fill="white" />
        
        {/* Small Detail: Notification Dot */}
        <circle cx="72" cy="28" r="8" fill="#EF4444" stroke="white" strokeWidth="4" />
      </svg>
      
      {/* Typography */}
      {withText && (
        <div className={`flex flex-col leading-none ${textColor}`}>
          <span className="font-bold text-xl tracking-tight">3rbst</span>
          <span className="text-[0.6rem] font-medium opacity-60 uppercase tracking-widest">Assistant</span>
        </div>
      )}
    </div>
  );
};