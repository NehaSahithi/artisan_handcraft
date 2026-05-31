import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, ShoppingBag, ArrowLeft, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailPage() {
  const { id } = useParams()
  const { getProduct } = useProductStore()
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id)
        setProduct(data.product)
      } catch (error) {
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id, getProduct])

  const handleAddToCart = async () => {
    if (!user) return toast.error('Please log in to add items to your cart')
    if (user.role !== 'buyer') return toast.error('Only buyers can add items to cart')
    
    const toastId = toast.loading('Adding to cart...')
    try {
      await addToCart(product._id, quantity)
      toast.success('Added to cart successfully!', { id: toastId })
    } catch (error) {
      toast.error(error.message, { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4"><Skeleton className="h-12 w-32" /><Skeleton className="h-12 w-full" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Artifact Not Found</h2>
        <p className="text-slate-500 mb-6">This product may have been removed or is no longer available.</p>
        <Link to="/products"><Button>Return to Collection</Button></Link>
      </div>
    )
  }

  const effectivePrice = product.discount > 0 ? product.finalPrice : product.price
  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/800x800?text=Karigar']

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Breadcrumb / Back Navigation */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery (Sticky) */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-6">
              {/* Main Image */}
              <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                {product.giCertified && (
                  <Badge className="absolute top-4 left-4 bg-amber-100 text-amber-800 hover:bg-amber-200 border-none shadow-sm font-semibold">
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Authentic GI Tag
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Header Area */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{product.rating?.average || "New"}</span>
                  <span className="text-slate-500">({product.rating?.count || 0} reviews)</span>
                </div>
                {product.originState && (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Origin: {product.originState}
                  </span>
                )}
              </div>
            </div>

            {/* Price Area */}
            <div className="mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900">₹{effectivePrice}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-slate-400 line-through mb-1">₹{product.price}</span>
                    <Badge variant="destructive" className="mb-1.5 font-bold">-{product.discount}%</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500">Local taxes included (where applicable)</p>
            </div>

            {/* Description */}
            <div className="prose prose-slate prose-sm mb-10">
              <p className="text-slate-600 leading-relaxed text-base">{product.description}</p>
            </div>

            {/* Buy Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Quantity</span>
                <span className="text-sm text-slate-500">
                  {product.stock > 0 ? `${product.stock} pieces available` : 'Out of stock'}
                </span>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-50 text-slate-600 rounded-l-xl transition-colors disabled:opacity-50"
                    disabled={quantity <= 1 || product.stock === 0}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-900">{product.stock === 0 ? 0 : quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-slate-50 text-slate-600 rounded-r-xl transition-colors disabled:opacity-50"
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 h-auto text-base font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg text-indigo-600"><Truck className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Direct Shipping</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ships from artisan within {product.craftingTime || '3-5 days'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg text-indigo-600"><RotateCcw className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Secure Purchase</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Protected by Karigar guarantee</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}