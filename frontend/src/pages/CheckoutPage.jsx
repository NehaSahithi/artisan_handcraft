import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import apiClient from '../lib/apiClient' // Used to securely verify the payment
import { MapPin, ShieldCheck, ArrowLeft, Lock, Loader2, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from "../components/ui/button"

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0 fixed" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-checkout" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-checkout)" />
  </svg>
)

// Dynamic Script Loader for Razorpay
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, getCart, clearCart } = useCartStore()
  const { createOrder } = useOrderStore() 
  
  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    getCart()
  }, [getCart])

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value })
  }

  // Calculate Display Totals (Backend does the real math)
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.finalPrice || item.product?.price || 0) * item.quantity, 0)
  const shippingCharge = totalAmount >= 500 ? 0 : 100
  const tax = Math.round(totalAmount * 0.05)
  const finalAmount = totalAmount + shippingCharge + tax

const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      return toast.error("Please complete the destination manifest.")
    }

    setLoading(true)

    try {
      // FIX: Bypass the store mismatch entirely by posting directly to your backend route via apiClient
// Post to the orders route (apiClient already prefixes with `/api`)
const apiResponse = await apiClient.post('/orders', { shippingAddress })      
      // Handle data nesting from Axios
      const responseData = apiResponse?.data || apiResponse
      
      if (!responseData?.success) throw new Error(responseData?.message || "Failed to create order")

      // 2. Handle Mock Payment Fallback (if keys are missing in your backend .env)
      if (responseData.mockPayment) {
        toast.loading("Processing Mock Payment...", { id: 'mock-pay' })
        
        // Tell your backend verify route to mark this as complete
        await apiClient.post('/orders/verify-payment', { 
          orderId: responseData.order._id,
          razorpayOrderId: responseData.razorpayOrder?.id || 'mock_order_12345',
          razorpayPaymentId: 'mock_pay_12345',
          razorpaySignature: 'mock_signature_bypass'
        })
        
        toast.success("Mock Acquisition Secured!", { id: 'mock-pay' })
        if (clearCart) clearCart()
        window.location.href = '/buyer/dashboard'
        return
      }

      // 3. Handle Real Razorpay Payment
      const res = await loadRazorpayScript()
      if (!res) throw new Error("Failed to load secure payment gateway. Check your connection.")

      const options = {
        key: responseData.key || responseData.keyId, 
        amount: responseData.razorpayOrder.amount, 
        currency: responseData.razorpayOrder.currency,
        name: "Karigar Artisans",
        description: "Acquisition of Cultural Heritage",
        order_id: responseData.razorpayOrder.id, 
        handler: async function (response) {
          try {
            toast.loading("Verifying signature...", { id: 'verify' })
            
            // Verify payment (apiClient already prefixes with `/api`)
            await apiClient.post('/orders/verify-payment', {
              orderId: responseData.order._id,
              razorpayOrderId: response.razorpay_order_id || responseData.razorpayOrder?.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              // Send native keys as secondary fallback
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            toast.success("Acquisition Secured Successfully!", { id: 'verify' })
            if (clearCart) clearCart()
            window.location.href = '/buyer/dashboard'
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed.", { id: 'verify' })
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: { color: "#9A3412" }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      
      paymentObject.on('payment.failed', function (response){
        toast.error(`Payment Failed: ${response.error.description}`)
      })

    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || "Failed to initialize secure transaction."
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center py-20">
      <h2 className="text-3xl font-serif font-bold mb-4">Your Curation is Empty</h2>
      <Link to="/products" className="text-primary underline font-serif">Return to Gallery</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-serif italic mb-8">
          <ArrowLeft className="w-4 h-4" /> Return to Curation
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Secure Acquisition</h1>
          <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/30 to-transparent mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* LEFT COLUMN: Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif font-bold text-foreground">Destination Manifest</h2>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group relative">
                    <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleChange} placeholder="Recipient Name" required
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                  </div>
                  <div className="group relative">
                    <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleChange} placeholder="Contact Number" required
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                  </div>
                </div>

                <div className="group relative">
                  <input type="text" name="street" value={shippingAddress.street} onChange={handleChange} placeholder="Street Address / Suite / Apartment" required
                    className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group relative md:col-span-1">
                    <input type="text" name="city" value={shippingAddress.city} onChange={handleChange} placeholder="City" required
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                  </div>
                  <div className="group relative md:col-span-1">
                    <input type="text" name="state" value={shippingAddress.state} onChange={handleChange} placeholder="State" required
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                  </div>
                  <div className="group relative md:col-span-1">
                    <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleChange} placeholder="PIN Code" required
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 px-1 text-foreground placeholder:text-muted-foreground transition-all" />
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-secondary/30 border border-border rounded-xl p-6 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-bold text-foreground mb-1">Guaranteed Authenticity</h3>
                <p className="text-sm text-muted-foreground font-serif">Every artifact is directly sourced from the verified artisan. Your funds are held securely until the piece is dispatched.</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary border border-border p-8 shadow-md sticky top-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-background border-b border-l border-border transform translate-x-4 -translate-y-4 rotate-45" />
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-background border-t border-r border-border transform -translate-x-4 translate-y-4 rotate-45" />

              <h2 className="font-serif font-bold text-2xl text-foreground mb-6 text-center">Final Contribution</h2>
              
              <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-serif border-b border-border/50 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-border overflow-hidden rounded-sm">
                        <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} alt="" className="w-full h-full object-cover filter sepia-[0.2]" />
                      </div>
                      <span className="text-foreground line-clamp-1 max-w-[150px]">{item.product?.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                    <span className="font-bold">₹{((item.product?.finalPrice || item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 text-base mb-8 font-serif pt-4 border-t-2 border-dashed border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Secure Transit</span>
                  <span className="font-medium text-foreground">{shippingCharge === 0 ? 'Complimentary' : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (5% GST)</span>
                  <span className="font-medium text-foreground">₹{tax.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t-2 border-dashed border-border pt-6 mb-8 bg-primary/5 -mx-8 px-8 pb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-lg font-serif font-bold text-foreground">Total</span>
                  <span className="text-3xl font-serif font-bold text-primary">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-14 text-lg font-serif font-bold rounded-sm border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Establishing Secure Link...</>
                ) : (
                  <><Lock className="w-5 h-5" /> Secure via Razorpay</>
                )}
              </Button>
              
              <div className="mt-4 flex justify-center items-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-serif uppercase tracking-widest">Encrypted Processing</span>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}