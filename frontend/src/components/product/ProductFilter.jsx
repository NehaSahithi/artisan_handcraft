import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Search, IndianRupee } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useArtisanStore } from '../../store/artisanStore';

const staticCategories = [
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

export default function ProductFilter({ filters, onFilterChange, onReset }) {
  const { categories, getCategories } = useProductStore();
  const { states, getStatesList } = useArtisanStore();

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Load categories and states list dynamically on mount
  useEffect(() => {
    getCategories();
    getStatesList();
  }, []);

  // Sync search input when filters clear or reset
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange('search', searchInput);
  };

  const handlePriceChange = (type, val) => {
    onFilterChange(type, val);
  };

  const activeCategories = categories.length > 0 ? categories : staticCategories;

  return (
    <div className="bg-white rounded-xl border border-amber-100/60 p-6 space-y-6 shadow-sm sticky top-24 font-sans">
      
      {/* Filter Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 font-serif font-bold text-stone-800 text-lg">
          <Filter className="w-5 h-5 text-primary" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-stone-400 hover:text-primary text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
          aria-label="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* 1. Keyword Text Search */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Keyword Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search craft, metal, blue..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-primary"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* 2. Craft Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Craft Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50 text-stone-700"
        >
          <option value="">All Categories</option>
          {activeCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Provenance Origin State */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Artisan State
        </label>
        <select
          value={filters.state || ''}
          onChange={(e) => onFilterChange('state', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50 text-stone-700"
        >
          <option value="">All States</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Price range bounds */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-stone-400 text-xs">₹</span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-stone-400 text-xs">₹</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50"
            />
          </div>
        </div>
      </div>

      {/* 5. Sort By Option */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Sort Results
        </label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-primary text-sm bg-stone-50/50 text-stone-700"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

    </div>
  );
}
