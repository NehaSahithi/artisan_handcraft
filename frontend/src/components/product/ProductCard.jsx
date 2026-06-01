import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ShieldCheck, MapPin } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  
  // SECURED PRICE snapshot snapshotting finalPrice calculated by backend
  const effectivePrice = product.discount > 0 ? product.finalPrice : product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevents the Link navigation when clicking the cart button
    
    if (!user) {
      return toast.error('Please log in to add items to your cart.');
    }
    if (user.role !== 'buyer') {
      return toast.error('Only registered buyers can add items to their carts.');
    }
    
    const toastId = toast.loading('Adding to cart...');
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item.', { id: toastId });
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      transition={{ duration: 0.2 }} 
      className="h-full flex"
    >
      <Link to={`/products/${product._id}`} className="block w-full">
        <div className="group flex flex-col h-full bg-white rounded-xl border border-amber-100/60 hover:border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          
          {/* Image Aspect ratio container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-50">
            <motion.img
              // CRITICAL BUG FIX: Read .url from the images object array
              src={product.images?.[0]?.url || 'https://placehold.co/600x400?text=Handicrafts'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
            />
            
            {/* Premium Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.discount > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
              {product.giCertified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  GI Tagged
                </span>
              )}
            </div>
          </div>

          {/* Card Content body */}
          <div className="p-5 flex flex-col flex-grow">
            
            {/* Header info */}
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating?.average > 0 ? product.rating.average.toFixed(1) : 'New'}</span>
              </div>
            </div>

            {/* Product Title */}
            <h3 className="font-serif font-bold text-stone-800 text-lg leading-snug mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>

            {/* Artisan Shop Name (Provenance indicator) */}
            {product.artisan && (
              <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>Crafted by {product.artisan.shopName || product.artisan.name}</span>
              </p>
            )}
            
            {/* Product description short summary */}
            <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed flex-grow">
              {product.description}
            </p>

            {/* Pricing and Cart Action Footer */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-stone-800">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.discount > 0 && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`p-2.5 rounded-full transition-all duration-200 shadow-sm ${
                  product.stock === 0
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-opacity-95 text-white hover:shadow-md hover:scale-105 active:scale-95'
                }`}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

          </div>

        </div>
      </Link>
    </motion.div>
  );
}