import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()
  const effectivePrice = product.discount > 0 ? product.finalPrice : product.price

  const handleAddToCart = async (e) => {
    e.preventDefault() // Prevents the Link click when clicking the cart button
    if (!user) return toast.error('Please log in to add items to cart')
    if (user.role !== 'buyer') return toast.error('Only buyers can add items to cart')
    
    const toastId = toast.loading('Adding to cart...')
    try {
      await addToCart(product._id, 1)
      toast.success('Added to cart!', { id: toastId })
    } catch (error) {
      toast.error(error.message, { id: toastId })
    }
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link to={`/products/${product._id}`} className="block h-full">
        <Card className="group overflow-hidden border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white rounded-xl">
          
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
            <motion.img
              src={product.images?.[0] || 'https://placehold.co/600x400?text=Karigar'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700"
              whileHover={{ 
                clipPath: "circle(100% at 50% 50%)",
                scale: 1.1 
              }}
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(100% at 50% 50%)" }}
            />
            
            {/* Premium Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.discount > 0 && (
                <Badge variant="destructive" className="font-semibold tracking-wide shadow-sm bg-red-500">
                  {product.discount}% OFF
                </Badge>
              )}
              {product.giCertified && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold shadow-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> GI Tagged
                </Badge>
              )}
            </div>
          </div>

          {/* Content Container */}
          <CardContent className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2.5">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {product.rating?.average || "New"}
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
              {product.description}
            </p>

            {/* Price & Action Footer */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">₹{effectivePrice}</span>
                {product.discount > 0 && (
                  <span className="text-xs text-slate-400 line-through decoration-slate-300">₹{product.price}</span>
                )}
              </div>

              <Button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="icon"
                variant={product.stock === 0 ? "secondary" : "default"}
                className={`rounded-full h-10 w-10 ${product.stock > 0 ? "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all" : ""}`}
              >
                <ShoppingBag className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}