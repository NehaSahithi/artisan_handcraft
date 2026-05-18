import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { getProduct } = useProductStore()
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id)
        setProduct(data.product)
      } catch (error) {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in first')
      return
    }
    try {
      await addToCart(product._id, quantity)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>
  if (!product) return <div className="min-h-screen flex items-center justify-center text-2xl">Product not found</div>

  const effectivePrice = product.discountedPrice || product.price

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={product.images?.[0]?.url || '🖼️'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <img key={idx} src={img.url} alt={`${idx}`} className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75" />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-saffron">₹{effectivePrice}</span>
              {product.discountPercent > 0 && (
                <span className="bg-saffron text-white px-3 py-1 rounded font-bold">
                  -{product.discountPercent}%
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-400">★</span>
              <span className="font-bold">{product.rating?.average || 0}</span>
              <span className="text-gray-500">({product.rating?.count || 0} reviews)</span>
            </div>

            <div className="mb-6 pb-6 border-b">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Category:</span>
                  <p>{product.category}</p>
                </div>
                <div>
                  <span className="font-semibold">Origin:</span>
                  <p>{product.originState}</p>
                </div>
                {product.craftingTime && (
                  <div>
                    <span className="font-semibold">Crafting Time:</span>
                    <p>{product.craftingTime}</p>
                  </div>
                )}
                {product.isFreeShipping && (
                  <div>
                    <span className="font-semibold">✓ Free Shipping</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="mb-6">
              <p className="mb-3 font-semibold">Quantity: {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
              {product.stock > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 px-4 py-2 rounded font-bold"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="bg-gray-200 px-4 py-2 rounded font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full btn-primary mb-3 disabled:opacity-50"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {product.customizationAvailable && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                ✓ Customization available - Contact seller
              </p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="pb-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{review.name}</span>
                      <span className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                  </div>
                  {review.title && <p className="font-semibold mb-1">{review.title}</p>}
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
