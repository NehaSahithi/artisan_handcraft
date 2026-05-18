import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const loadRazorpaySdk = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotalPrice, getCart } = useCartStore()
  const { createRazorpayOrder, verifyPayment } = useOrderStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    getCart().catch(() => {})
  }, [getCart])

  const handleCheckout = async () => {
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      toast.error('Please fill in all shipping details')
      return
    }

    setLoading(true)
    try {
      // Create order and Razorpay order on backend
      const razorpayRes = await createRazorpayOrder({
        shippingAddress: shippingInfo,
      })

      if (razorpayRes.mockPayment) {
        await verifyPayment({
          orderId: razorpayRes.order._id,
          razorpayPaymentId: `mock_payment_${Date.now()}`,
          razorpaySignature: 'mock_signature',
        })
        toast.success('Order placed successfully!')
        navigate('/dashboard')
        return
      }

      const sdkLoaded = await loadRazorpaySdk()
      if (!sdkLoaded) {
        toast.error('Unable to load payment gateway. Please try again.')
        return
      }
      
      // Open Razorpay payment modal
      const options = {
        key: razorpayRes.keyId,
        amount: razorpayRes.razorpayOrder.amount,
        currency: razorpayRes.razorpayOrder.currency || 'INR',
        order_id: razorpayRes.razorpayOrder.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId: razorpayRes.order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast.success('Order placed successfully!')
            navigate('/dashboard')
          } catch (error) {
            toast.error('Failed to process order')
          }
        },
        prefill: {
          name: shippingInfo.fullName,
          email: user.email,
          contact: shippingInfo.phone,
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 999 ? 0 : 99
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="section-title">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
            
            <form className="space-y-4">
              <input
                type="text"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="text"
                name="street"
                value={shippingInfo.street}
                onChange={handleInputChange}
                placeholder="Street Address"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="border border-gray-300 rounded px-4 py-2"
                />
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <input
                type="text"
                name="pincode"
                value={shippingInfo.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 h-fit">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 pb-4 border-b mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? '✓ Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₹{tax}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="text-saffron">₹{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
