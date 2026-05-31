import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../lib/apiClient'
import { useCartStore } from '../store/cartStore'
import { MapPin, ShieldCheck, ArrowLeft, Plus, Minus, ShoppingBag, Leaf, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg className="fixed inset-0 w-full h-full opacity-[0.02] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-detail" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-detail)" />
  </svg>
)

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-8 opacity-30">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-4 h-4 text-primary mx-4 flex-shrink-0" />
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
)

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCart } = useCartStore() 
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`)
        // Handle varying backend response structures gracefully
        const productData = res.data?.product || res.data
        setProduct(productData)
      } catch (error) {
        console.error("Artifact fetch error:", error)
        toast.error("The requested artifact could not be found.")
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProductDetails()
  }, [id, navigate])

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      // Safely interact directly with the cart API to prevent store mismatches
      await apiClient.post('/cart', { 
        productId: product._id, 
        quantity 
      })
      toast.success("Artifact secured in your curation.")
      if (getCart) getCart() // Refresh global cart badge
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add to curation.")
    } finally {
      setLoading(false)
      setAddingToCart(false)
    }
  }

  const updateQuantity = (delta) => {
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="font-serif italic text-muted-foreground text-lg">Retrieving from the archives...</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  // Setup fallbacks for visual assets
  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/800x800?text=Heritage+Artifact']
  const displayPrice = product.finalPrice || product.price || 0
  const artisanName = product.artisan?.name || product.artisan?.shopName || 'Master Artisan'

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-serif italic mb-8 md:mb-12">
          <ArrowLeft className="w-4 h-4" /> Return to Gallery
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT: Masterpiece Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="sticky top-24 space-y-6">
              {/* Main Canvas Frame */}
              <div className="w-full aspect-square bg-secondary/50 rounded-2xl border-2 border-border overflow-hidden relative shadow-md group p-4">
                <div className="w-full h-full relative overflow-hidden rounded-xl bg-background shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={images[activeImage]}
                      alt={product.name}
                      className="w-full h-full object-cover filter sepia-[0.1] hover:sepia-0 hover:scale-110 transition-all duration-700"
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover filter sepia-[0.2]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Curatorial Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col justify-center">
            
            <div className="mb-6">
              <Link to={`/artisans/${product.artisan?._id}`} className="inline-block text-primary font-serif italic text-lg hover:underline mb-2">
                By {artisanName}
              </Link>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-serif font-bold text-primary">₹{displayPrice.toLocaleString()}</span>
              {product.price > displayPrice && (
                <span className="text-xl font-serif text-muted-foreground line-through mb-1">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-lg text-muted-foreground font-serif leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Authenticity Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-serif font-bold">Verified Origin</span>
              </div>
              <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-serif font-bold">100% Handcrafted</span>
              </div>
            </div>

            <HeritageDivider />

            {/* Acquisition Controls */}
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-foreground">Edition Size</span>
                <span className={`text-sm font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {product.stock > 0 ? `${product.stock} Available` : 'Archive Sold Out'}
                </span>
              </div>

              {product.stock > 0 ? (
                <div className="flex gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-background border-2 border-border rounded-sm px-4 py-2 w-32">
                    <button onClick={() => updateQuantity(-1)} className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50" disabled={quantity <= 1}>
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-serif font-bold text-lg">{quantity}</span>
                    <button onClick={() => updateQuantity(1)} className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50" disabled={quantity >= product.stock}>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 h-auto text-lg font-serif font-bold rounded-sm border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-md flex items-center justify-center gap-3 py-4"
                  >
                    {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                    Add to Curation
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full h-auto text-lg font-serif font-bold rounded-sm border-2 border-muted bg-muted text-muted-foreground py-4">
                  Currently Out of Stock
                </Button>
              )}
            </div>

            <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground font-serif italic bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>This artifact ships directly from the artisan's studio. Please allow 5-7 business days for secure packing and heritage transit.</p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}