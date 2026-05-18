import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()
  const effectivePrice = product.finalPrice ?? product.price

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart')
      return
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can add items to cart')
      return
    }
    try {
      await addToCart(product._id, 1)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="card-product">
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-gray-100 h-48">
        <img
          src={product.images?.[0] || 'https://placehold.co/600x400?text=Karigar'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-saffron text-white px-2 py-1 rounded text-xs font-bold">
            -{product.discount}%
          </div>
        )}
        {product.giCertified && (
          <div className="absolute top-2 left-2 bg-gold text-black px-2 py-1 rounded text-xs font-bold">
            GI Tagged
          </div>
        )}
      </Link>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">
          <Link to={`/products/${product._id}`} className="hover:text-saffron">
            {product.name}
          </Link>
        </h3>

        <div className="text-xs text-gray-500 mb-2">
          <span className="badge-artisan">{product.category}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">₹{effectivePrice}</span>
            {product.finalPrice && product.finalPrice < product.price && (
              <span className="text-sm line-through text-gray-400">₹{product.price}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{product.rating?.average || 0}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {product.stock === 0 ? (
          <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-semibold cursor-not-allowed">
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary text-sm"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}
