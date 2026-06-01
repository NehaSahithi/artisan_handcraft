import React from 'react';

/**
 * Styled SVG representing a traditional Indian Lotus Flower motif.
 * Symbolizes purity, handcraft legacy, and beauty.
 */
export const LotusMotif = ({ className = 'w-12 h-12 text-primary', ...props }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`fill-current animate-lotus transition-all duration-300 ${className}`} 
      {...props}
    >
      {/* Stylized Symmetrical Lotus Petals */}
      <path d="M50,15 C54,32 68,40 76,46 C60,46 54,35 50,22 C46,35 40,46 24,46 C32,40 46,32 50,15 Z" />
      <path d="M50,28 C56,42 74,48 84,56 C66,54 58,45 50,38 C42,45 34,54 16,56 C26,48 44,42 50,28 Z" />
      <path d="M50,42 C58,54 78,60 88,72 C68,68 58,58 50,52 C42,58 32,68 12,72 C22,60 42,54 50,42 Z" />
      {/* Base & Roots */}
      <path d="M35,76 C42,80 58,80 65,76 C60,84 40,84 35,76 Z" />
      <circle cx="50" cy="85" r="3" />
    </svg>
  );
};

/**
 * A beautiful, seamless background block print vector pattern.
 * Evokes authentic Indian textile handloom prints (e.g. Ajrakh, Dabu, Jaipur).
 */
export const BlockPrintPattern = ({ className = 'opacity-5', ...props }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30,5 C32,15 38,18 42,20 C34,20 32,16 30,10 C28,16 26,20 18,20 C22,18 28,15 30,5 Z M30,12 C33,20 42,23 47,27 C37,26 34,22 30,19 C26,22 23,26 13,27 C18,23 27,20 30,12 Z M30,35 C32,45 38,48 42,50 C34,50 32,46 30,40 C28,46 26,50 18,50 C22,48 28,45 30,35 Z M30,42 C33,50 42,53 47,57 C37,56 34,52 30,49 C26,52 23,56 13,57 C18,53 27,50 30,42 Z' fill='%238c5b3f' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}
      {...props}
    />
  );
};

/**
 * Premium horizontal section divider consisting of gold borders and a center lotus flower.
 */
export const HeritageDivider = ({ className = 'my-8', ...props }) => {
  return (
    <div className={`flex items-center justify-center w-full ${className}`} {...props}>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent to-amber-200" />
      <div className="mx-4 flex items-center justify-center text-amber-500">
        <LotusMotif className="w-8 h-8 opacity-70" />
      </div>
      <div className="flex-grow h-px bg-gradient-to-l from-transparent to-amber-200" />
    </div>
  );
};
