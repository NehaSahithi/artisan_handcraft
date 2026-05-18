import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '../store/productStore'
import ProductCard from '../components/product/ProductCard'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getProducts, products, loading } = useProductStore()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: searchParams.get('state') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
  })

  useEffect(() => {
    getProducts(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const categories = ['Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting', 'Embroidery', 'Metalwork', 'Block Printing']
  const states = ['Rajasthan', 'Odisha', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Madhya Pradesh', 'Karnataka']

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">Browse Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="bg-white rounded-lg p-6 h-fit">
            <h3 className="font-bold text-lg mb-4">Filters</h3>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Search</label>
              <input
                type="text"
                placeholder="Product name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* State */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Origin State</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All States</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Price Range</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Ratings</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="-createdAt">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card-product h-64 bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
