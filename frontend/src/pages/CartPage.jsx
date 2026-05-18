import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { getCart, items, removeItem, updateItem, loading } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    getCart()
  }, [])

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId)
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(productId)
      return
    }
    try {
      await updateItem(productId, newQuantity)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const price = item.product?.finalPrice ?? item.product?.price ?? item.price ?? 0
    return sum + price * item.quantity
  }, 0)
  const shippingCharge = totalAmount >= 999 ? 0 : 99
  const tax = Math.round(totalAmount * 0.05)
  const finalAmount = totalAmount + shippingCharge + tax

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-2xl mb-4">🛒</p>
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.product?._id || item.product} className="bg-white rounded-lg p-4 flex gap-4">
                  <img
                    src={item.product?.images?.[0] || 'https://placehold.co/300x300?text=Item'}
                    alt={item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <Link to={`/products/${item.product?._id || item.product}`} className="font-bold hover:text-saffron">
                      {item.product?.name || 'Product'}
                    </Link>
                    <p className="text-sm text-gray-600">{item.artisan?.name || 'Artisan'}</p>
                    <p className="text-lg font-bold mt-1">₹{item.product?.finalPrice ?? item.product?.price ?? item.price ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      −
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.product?._id || item.product)}
                    className="text-red-600 font-bold"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 h-fit">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">{shippingCharge === 0 ? '✓ Free' : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">₹{tax}</span>
                </div>
              </div>
              <div className="py-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-saffron">₹{finalAmount.toLocaleString()}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
              <Link to="/products" className="block text-center mt-3 text-saffron font-semibold hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
