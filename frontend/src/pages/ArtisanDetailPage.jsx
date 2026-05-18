import { useParams, useState, useEffect } from 'react'
import { useArtisanStore } from '../store/artisanStore'

export default function ArtisanDetailPage() {
  const { id } = useParams()
  const { getArtisan } = useArtisanStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getArtisan(id)
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!data) return <div className="min-h-screen flex items-center justify-center">Artisan not found</div>

  const { artisan, products } = data

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        {/* Artisan Header */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">🪔</div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">{artisan.shopName}</h1>
              <p className="text-gray-600 mb-4">{artisan.story}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Rating:</span>
                  <p>⭐ {artisan.rating?.average}</p>
                </div>
                <div>
                  <span className="font-semibold">Location:</span>
                  <p>{artisan.state}</p>
                </div>
                <div>
                  <span className="font-semibold">Craft:</span>
                  <p>{artisan.craftCategories?.join(', ')}</p>
                </div>
                <div>
                  <span className="font-semibold">Experience:</span>
                  <p>{artisan.yearsOfExperience} years</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="section-title">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products?.map(p => (
              <div key={p._id} className="bg-white rounded-lg p-4 text-center">
                <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />
                <p className="font-bold text-sm mb-1">{p.name}</p>
                <p className="text-saffron font-bold">₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
