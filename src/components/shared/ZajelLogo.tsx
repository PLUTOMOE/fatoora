"use client";

import React from 'react';
import Image from 'next/image';

interface ZajelLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function ZajelLogo({ variant = 'dark', size = 'md', showText = true, className = '' }: ZajelLogoProps) {
  const isDark = variant === 'dark';

  // Sizing maps
  const dimensionMap = {
    sm: { imgWidth: 32, imgHeight: 32, textClass: 'text-sm' },
    md: { imgWidth: 44, imgHeight: 44, textClass: 'text-base' },
    lg: { imgWidth: 60, imgHeight: 60, textClass: 'text-xl' },
  };

  const { imgWidth, imgHeight, textClass } = dimensionMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-1 select-none ${className}`}>
      {/* Circular Emblem Container */}
      <div className="relative flex items-center justify-center">
        {/* Attempt to load crisp cropped image */}
        <div 
          className="relative flex items-center justify-center rounded-full overflow-hidden"
          style={{ width: imgWidth, height: imgHeight }}
        >
          <img
            src={isDark ? '/logo-zajel-dark.png' : '/logo-zajel-light.png'}
            alt="زاجل النخبة"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Graceful SVG fallback if image path issues
              const target = e.currentTarget as HTMLElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Vector SVG Emblem Fallback */}
          <div 
            style={{ display: 'none', width: imgWidth, height: imgHeight }}
            className={`items-center justify-center rounded-full border-2 border-[#C59A55] ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}
          >
            <span className="font-bold text-[#C59A55] text-xs tracking-wider">ZJ</span>
          </div>
        </div>
      </div>

      {showText && (
        <span 
          className={`font-bold tracking-tight text-center ${textClass} ${
            isDark ? 'text-white' : 'text-[#202D3B]'
          }`}
        >
          زاجل النخبة
        </span>
      )}
    </div>
  );
}
