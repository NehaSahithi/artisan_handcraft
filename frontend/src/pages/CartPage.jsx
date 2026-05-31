import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Traditional Lotus Motif SVG
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

// Block Print Pattern Background
const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-cart" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-cart)" />
  </svg>
)

// Traditional Divider
const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-6 opacity-30">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-4 h-4 text-primary mx-2 flex-shrink-0" />
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
)

export default function CartPage() {
  const { getCart, items, removeItem, updateItem, loading } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    getCart()
  }, [getCart])

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId)
      toast.success('Artifact removed from curation')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return handleRemove(productId)
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
  const shippingCharge = totalAmount >= 999 || totalAmount === 0 ? 0 : 99
  const tax = Math.round(totalAmount * 0.05)
  const finalAmount = totalAmount + shippingCharge + tax

  // --- EMPTY STATE (Heritage Gallery Vibe) ---
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-background relative flex flex-col items-center justify-center p-4 overflow-hidden">
        <BlockPrintPattern />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto border border-primary/20 rounded-t-full bg-secondary flex items-center justify-center mb-8 shadow-inner">
            <LotusMotif className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Your Curation is Empty</h2>
          <p className="text-muted-foreground font-serif text-lg mb-8 italic">
            You haven't selected any masterpieces for your collection yet.
          </p>
          <Link to="/products">
            <Button className="rounded-sm px-8 h-12 text-lg font-serif tracking-wide border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all">
              Wander the Gallery
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20">
      <BlockPrintPattern />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Your Curation</h1>
          <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/30 to-transparent mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <AnimatePresence>
              {items.map((item, idx) => {
                const price = item.product?.finalPrice ?? item.product?.price ?? item.price ?? 0
                return (
                  <motion.div
                    key={item.product?._id || item.product}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-secondary border border-border shadow-sm hover:border-primary/50 transition-colors rounded-tr-3xl rounded-bl-3xl"
                  >
                    {/* Image Block */}
                    <div className="w-full sm:w-40 h-40 flex-shrink-0 border-[3px] border-background shadow-inner overflow-hidden relative">
                      <img
                        src={item.product?.images?.[0] || 'https://placehold.co/300x300?text=Art'}
                        alt={item.product?.name || 'Artifact'}
                        className="w-full h-full object-cover filter sepia-[0.1] group-hover:sepia-0 transition-all duration-700 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Content Block */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                            {item.product?.category || 'Handicraft'}
                          </p>
                          <Link to={`/products/${item.product?._id || item.product}`} className="text-xl font-serif font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {item.product?.name || 'Untitled Artifact'}
                          </Link>
                          <p className="text-sm text-muted-foreground font-serif italic mt-1">
                            Crafted by {item.artisan?.name || item.artisan?.shopName || 'Master Artisan'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.product?._id || item.product)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2"
                          aria-label="Remove artifact"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        {/* Custom Heritage Quantity Selector */}
                        <div className="flex items-center bg-background border border-border rounded-sm overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity - 1)}
                            className="p-2.5 hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-serif font-bold text-foreground text-base border-x border-border/50 py-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity + 1)}
                            className="p-2.5 hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-2xl font-serif font-bold text-foreground">
                          ₹{(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Panel (Parchment Ticket Style) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-secondary border border-border p-8 shadow-md sticky top-24 relative overflow-hidden">
              {/* Decorative Corner Folds */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-background border-b border-l border-border transform translate-x-4 -translate-y-4 rotate-45" />
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-background border-t border-r border-border transform -translate-x-4 translate-y-4 rotate-45" />

              <h2 className="font-serif font-bold text-2xl text-foreground mb-2 text-center">Summary of Value</h2>
              <HeritageDivider />
              
              <div className="space-y-5 text-base mb-8 font-serif">
                <div className="flex justify-between text-muted-foreground">
                  <span>Artifacts ({items.length})</span>
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
              
              <div className="border-t-2 border-dashed border-border pt-6 mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-lg font-serif font-bold text-foreground">Total Contribution</span>
                  <span className="text-3xl font-serif font-bold text-primary">₹{finalAmount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground text-right italic font-serif">Directly empowering rural artisans</p>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                disabled={loading}
                className="w-full h-14 text-lg font-serif font-bold rounded-sm border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-lg"
              >
                Secure Acquisition <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="mt-8 flex items-center justify-center gap-3 text-sm font-serif italic text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Guaranteed Authentic & GI Certified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}