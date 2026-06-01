import React from 'react';
import { LotusMotif } from './Heritage';

/**
 * Premium loading spinner component.
 * Combines an active spin border with our floating LotusMotif in the center.
 * 
 * @param {Object} props
 * @param {boolean} props.fullPage - If true, covers the entire viewport with a backdrop blur.
 * @param {'sm'|'md'|'lg'} props.size - Spinner sizing scale.
 * @param {string} props.message - Custom loading string beneath the spinner.
 */
export const LoadingSpinner = ({ fullPage = false, size = 'md', message = 'Gathering handmade treasures...' }) => {
  const ringSize = {
    sm: 'w-10 h-10 border-2',
    md: 'w-20 h-20 border-4',
    lg: 'w-28 h-28 border-4'
  };

  const lotusSize = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 bg-background/70 backdrop-blur-md z-50 flex items-center justify-center'
    : 'w-full py-16 flex flex-col items-center justify-center';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="relative flex flex-col items-center">
        {/* Rotating outer spinner ring */}
        <div className={`animate-spin rounded-full border-amber-100 border-t-primary ${ringSize[size]}`} />
        
        {/* Static center floating lotus icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ marginTop: size === 'sm' ? '0' : '-8px' }}>
          <LotusMotif className={`text-amber-500/80 animate-lotus ${lotusSize[size]}`} />
        </div>
        
        {/* Soft load text */}
        {size !== 'sm' && (
          <p className="mt-6 font-serif text-sm italic text-stone-500 tracking-wide animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
