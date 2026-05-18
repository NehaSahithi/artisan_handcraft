import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/productStore'
import { useArtisanStore } from '../store/artisanStore'
import ProductCard from '../components/product/ProductCard'

export default function HomePage() {
  const { getProducts, products } = useProductStore()
  const { getArtisans, artisans } = useArtisanStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getProducts({ limit: 8, isFeatured: true }),
          getArtisans({ limit: 6, isFeatured: true }),
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-saffron to-clay text-white py-16 md:py-24">
        <div className="container-custom text-center">
          <div className="text-5xl md:text-6xl mb-4">🪔</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Connect with Indian Artisans
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Support authentic handicrafts from rural artisans. Every purchase preserves cultural heritage and empowers communities.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/products" className="btn-primary bg-white text-clay hover:bg-gray-100">
              Explore Products
            </Link>
            <Link to="/artisans" className="btn-outline border-white text-white hover:bg-white hover:text-clay">
              Meet Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Explore traditional Indian crafts</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting', 'Embroidery', 'Metalwork', 'Block Printing'].map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-saffron transition-all"
              >
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold text-gray-900">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Handpicked collections from our artisans</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="card-product h-64 bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title">Featured Artisans</h2>
          <p className="section-subtitle">Meet the craftspeople behind the creations</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artisans.slice(0, 3).map((artisan) => (
                <Link
                  key={artisan._id}
                  to={`/artisans/${artisan._id}`}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 bg-gradient-to-r from-saffron to-clay flex items-center justify-center text-4xl">
                    🪔
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1">{artisan.shopName}</h3>
                    <p className="text-sm text-gray-600 mb-3">{artisan.craftCategories?.join(', ') || 'Traditional Crafts'}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">⭐ {artisan.rating?.average || 0}</span>
                      <span className="text-gray-500">{artisan.state}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/artisans" className="btn-secondary">
              Explore All Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Why Karigar */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="section-title">Why Choose Karigar?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[
              { icon: '👥', title: 'Direct from Artisans', desc: 'No middlemen - fair prices for craftspeople' },
              { icon: '🏛️', title: 'Authentic Crafts', desc: 'Traditional techniques, cultural heritage preserved' },
              { icon: '🌍', title: 'Empowerment', desc: 'Support rural communities and preserve traditions' },
              { icon: '✨', title: 'Quality Guaranteed', desc: 'Every product handmade with care and pride' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
