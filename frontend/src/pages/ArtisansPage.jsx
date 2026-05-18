import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useArtisanStore } from '../store/artisanStore'

export default function ArtisansPage() {
  const { getArtisans, artisans, loading } = useArtisanStore()
  const [filters, setFilters] = useState({ state: '', craft: '' })

  useEffect(() => {
    getArtisans(filters)
  }, [filters])

  const states = ['Rajasthan', 'Odisha', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Madhya Pradesh', 'Karnataka']
  const categories = ['Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting', 'Embroidery', 'Metalwork', 'Block Printing']

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">Discover Artisans</h1>
        <p className="section-subtitle">Meet the craftspeople preserving traditional heritage</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select
            value={filters.state}
            onChange={(e) => setFilters({...filters, state: e.target.value})}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.craft}
            onChange={(e) => setFilters({...filters, craft: e.target.value})}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Artisans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-lg h-64 animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artisans.map(artisan => (
              <Link
                key={artisan._id}
                to={`/artisans/${artisan._id}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-r from-saffron to-clay flex items-center justify-center text-5xl">
                  🪔
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{artisan.shopName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{artisan.craftCategories?.join(', ')}</p>
                  <p className="text-xs text-gray-500 mb-3">{artisan.state}</p>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>⭐ {artisan.rating?.average || 0}</span>
                    <span className="text-saffron">View Profile →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
