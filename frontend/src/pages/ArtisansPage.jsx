import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtisanStore } from '../store/artisanStore';
import Pagination from '../components/common/Pagination';
import { MapPin, Award, ArrowRight, Paintbrush, Search, Loader2, CheckCircle } from 'lucide-react';

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
      <pattern id="paisley-artisans" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-artisans)" />
  </svg>
);

const staticCategories = [
  'All',
  'Pottery & Ceramics',
  'Textiles & Weaving',
  'Wood Carving',
  'Metal Work',
  'Jewelry',
  'Leather Craft',
  'Bamboo & Cane',
  'Stone Carving',
  'Painting & Art',
  'Embroidery',
  'Block Printing',
  'Papier Mache',
  'Glass Work',
  'Jute Craft',
  'Lac Work',
  'Bell Metal',
  'Dhokra Art'
];

export default function ArtisansPage() {
  const { getArtisans, artisans, pagination, loading } = useArtisanStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [page, setPage] = useState(1);

  useEffect(() => {
    const filters = {
      page,
      limit: 9,
      craft: activeFilter === 'All' ? '' : activeFilter,
      search: searchQuery
    };
    getArtisans(filters);
  }, [page, activeFilter, searchQuery, getArtisans]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleCategorySelect = (category) => {
    setActiveFilter(category);
    setPage(1);
  };

  const handleReset = () => {
    setActiveFilter('All');
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 relative selection:bg-primary/20 selection:text-primary pb-24 font-sans">
      <BlockPrintPattern />

      {/* HEADER SECTION */}
      <section className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 mb-6 text-primary">
            <LotusMotif className="w-6 h-6" />
            <span className="text-xs font-semibold tracking-widest uppercase">The Creators</span>
            <LotusMotif className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-stone-900 leading-tight">
            Master <span className="text-primary italic">Karigars</span>
          </h1>
          <p className="text-base md:text-lg text-stone-600 font-serif max-w-2xl mx-auto italic">
            Meet the rural guardians of India's legacy. Every master karigar has dedicated their life to perfecting techniques passed down through generations.
          </p>
        </motion.div>
      </section>

      {/* CONTROLS (Search Bar) */}
      <section className="max-w-md mx-auto px-4 relative z-10 mb-10">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <input
            type="text"
            placeholder="Search karigars or traditional stories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-white shadow-sm font-serif"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-primary transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </section>

      {/* CATEGORIES PILLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-16">
        <div className="flex flex-wrap justify-center gap-2.5 max-h-36 overflow-y-auto p-2 bg-stone-100/60 rounded-xl border border-stone-200/80 scrollbar-thin">
          {staticCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-5 py-2 rounded-full font-serif text-xs md:text-sm border transition-all duration-300 ${
                activeFilter === category
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* ARTISAN GALLERY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="font-serif italic text-stone-500 text-lg uppercase tracking-wider animate-pulse">Gathering the Masters...</p>
          </div>
        ) : !artisans || artisans.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-100 rounded-xl shadow-sm max-w-lg mx-auto">
            <LotusMotif className="w-16 h-16 text-primary/10 mx-auto mb-6" />
            <p className="text-lg font-serif text-stone-600 italic">No master karigars found matching these parameters.</p>
            <button 
              onClick={handleReset} 
              className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:bg-primary/95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {artisans.map((artisan, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    key={artisan._id}
                    className="group"
                  >
                    <Link 
                      to={`/artisans/${artisan._id}`} 
                      className="block h-full bg-white border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-500 rounded-t-[40%] rounded-b-xl overflow-hidden relative"
                    >
                      {/* Image Block (Arch Style) */}
                      <div className="w-full aspect-square relative overflow-hidden border-b border-stone-100 bg-stone-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay" />
                        <img 
                          src={artisan.shopLogo || artisan.user?.avatar || 'https://placehold.co/600x600?text=Master+Artisan'} 
                          alt={artisan.shopName || artisan.name}
                          className="w-full h-full object-cover filter sepia-[0.1] group-hover:sepia-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-1.5">
                          {artisan.craftCategories?.slice(0, 2).map((craft) => (
                            <span key={craft} className="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider rounded border border-primary/10">
                              {craft}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Content Block */}
                      <div className="p-8 text-center bg-white relative">
                        <Paintbrush className="absolute right-4 bottom-4 w-20 h-20 text-stone-100 opacity-30 transform -rotate-12 group-hover:rotate-0 group-hover:text-primary/5 transition-all duration-700" />
                        
                        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1 group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                          {artisan.shopName || artisan.name}
                          {artisan.isVerified && <CheckCircle className="w-5 h-5 text-emerald-600" title="Verified Karigar" />}
                        </h2>
                        <p className="text-stone-500 font-serif text-sm italic mb-6">by {artisan.user?.name || artisan.name}</p>
                        
                        <div className="flex justify-center gap-6 text-xs text-stone-600 mb-8 border-y border-stone-100 py-3.5">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {artisan.location?.state || 'India'}
                          </div>
                          <div className="w-px h-4 bg-stone-200" />
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-primary" />
                            {artisan.yearsOfExperience ? `${artisan.yearsOfExperience} Yrs` : 'Master'}
                          </div>
                        </div>

                        <div className="inline-flex items-center justify-center gap-1.5 text-primary font-serif font-bold text-base group-hover:gap-3 transition-all">
                          Enter Studio <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(pageNumber) => setPage(pageNumber)}
            />
          </>
        )}
      </section>
    </div>
  );
}