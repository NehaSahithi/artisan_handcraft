import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standard reusable pagination control widget.
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Currently active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages available
 * @param {Function} props.onPageChange - Page change callback trigger: (pageNumber) => void
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate range of page numbers to display
  const pageNumbers = [];
  const maxButtons = 5; // limit visible buttons
  
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex items-center justify-center space-x-2 my-12" aria-label="Pagination Navigation">
      {/* Prev Page Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center p-2 rounded-lg border border-border bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Numerical Page Buttons */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center border text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            1
          </button>
          {startPage > 2 && <span className="text-stone-400 px-1">...</span>}
        </>
      )}

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border text-sm font-medium transition-all duration-200 ${
            currentPage === pageNumber
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
          aria-current={currentPage === pageNumber ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-stone-400 px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center border text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center p-2 rounded-lg border border-border bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Next Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default Pagination;
