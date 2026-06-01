import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/product/ProductFilter';
import Pagination from '../components/common/Pagination';
import { Loader2 } from 'lucide-react';

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0 fixed" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley-gallery" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-gallery)" />
  </svg>
);

// Framer Motion Variants for Staggered Stepwell Effect
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
};

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { products, getProducts, pagination, loading } = useProductStore();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: searchParams.get('state') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  // Sync with searchParams if they change externally (e.g. Nav Link clicks)
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    setFilters((prev) => ({
      ...prev,
      category,
      search,
      state,
      page: 1
    }));
  }, [searchParams]);

  useEffect(() => {
    getProducts(filters);
  }, [filters, getProducts]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      state: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="min-h-screen bg-stone-50/50 relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* EDITORIAL HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <LotusMotif className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Curated Collection</span>
            <LotusMotif className="w-5 h-5" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            The Artisan <span className="text-primary italic">Gallery</span>
          </h1>
          <p className="text-base md:text-lg text-stone-600 font-serif italic max-w-2xl mx-auto">
            Discover authentic, handcrafted masterpieces directly from the rural master artisans of India. Every piece carries the soul of its creator and the legacy of its region.
          </p>
        </motion.div>

        {/* MAIN LAYOUT (Filter Sidebar + Products Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT COLUMN: FILTERS */}
          <div className="lg:col-span-1">
            <ProductFilter 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              onReset={handleReset} 
            />
          </div>

          {/* RIGHT COLUMN: PRODUCTS LIST */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-stone-100 shadow-sm">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                <p className="font-serif italic text-stone-500 text-lg">Curating the gallery...</p>
              </div>
            ) : !products || products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-24 bg-white border border-stone-100 rounded-xl shadow-sm"
              >
                <LotusMotif className="w-16 h-16 text-primary/10 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">No Artifacts Found</h3>
                <p className="text-stone-500 font-serif italic max-w-md mx-auto px-4">
                  The specific cultural artifacts you are searching for are currently not in our archive or match no listings.
                </p>
                <button 
                  onClick={handleReset}
                  className="mt-8 px-6 py-2.5 bg-primary text-white font-bold font-serif hover:bg-primary/95 shadow-md transition-all rounded-lg text-sm"
                >
                  Reset Curation
                </button>
              </motion.div>
            ) : (
              <>
                {/* Result count & quick stats */}
                <div className="flex justify-between items-center text-xs text-stone-500 font-medium px-1">
                  <span>
                    Showing {products.length} of {pagination.total} handcrafted masterpieces
                  </span>
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                </div>

                {/* Product Grid */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.div key={product._id} variants={itemVariants} layout className="h-full">
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                <Pagination 
                  currentPage={pagination.page} 
                  totalPages={pagination.pages} 
                  onPageChange={(pageNumber) => handleFilterChange('page', pageNumber)} 
                />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}