import React from 'react';
import { HelpCircle } from 'lucide-react';
import { LotusMotif } from './Heritage';

/**
 * Premium reusable empty state / placeholder page component.
 * 
 * @param {Object} props
 * @param {string} props.title - Main header.
 * @param {string} props.description - Explanatory helper text.
 * @param {React.ReactNode} props.icon - Custom React element or icon (defaults to LotusMotif).
 * @param {React.ReactNode} props.action - Optional React button or node to trigger clear functions.
 */
export const EmptyState = ({ 
  title = 'No Treasures Found', 
  description = 'Earthy authentic handicrafts are coming soon. Try adjusting your search query or resetting filters.', 
  icon = null, 
  action = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/50 backdrop-blur-sm rounded-xl border border-border max-w-2xl mx-auto my-8">
      {/* Icon frame */}
      <div className="mb-6 p-4 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
        {icon ? icon : <LotusMotif className="w-14 h-14 text-amber-600/80 animate-lotus" />}
      </div>
      
      {/* Messages */}
      <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">
        {title}
      </h3>
      <p className="text-stone-500 text-sm max-w-md leading-relaxed mb-8">
        {description}
      </p>
      
      {/* Call to action */}
      {action && (
        <div className="animate-fade-in">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
