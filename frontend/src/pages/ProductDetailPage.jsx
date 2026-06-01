import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { MapPin, ShieldCheck, ArrowLeft, Plus, Minus, ShoppingBag, Leaf, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "../components/ui/button";

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg className="fixed inset-0 w-full h-full opacity-[0.02] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley-detail" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-detail)" />
  </svg>
);

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-8 opacity-30">
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-4 h-4 text-primary mx-4 flex-shrink-0" />
    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, reviews, getProduct, addReview, loading } = useProductStore();
  const { addToCart, getCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Review Form state
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        await getProduct(id);
      } catch (error) {
        console.error("Artifact fetch error:", error);
        toast.error("The requested artifact could not be found.");
        navigate('/products');
      }
    };
    fetchProductDetails();
  }, [id, navigate, getProduct]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      toast.success("Artifact secured in your curation.");
      if (getCart) getCart(); // Sync nav cart totals
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add to curation.");
    } finally {
      setAddingToCart(false);
    }
  };

  const updateQuantity = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewFormData.comment.trim()) {
      return toast.error("Please add a comment for your review.");
    }

    setSubmittingReview(true);
    try {
      await addReview(product._id, reviewFormData);
      toast.success("Review submitted. Thank you for your feedback!");
      setReviewFormData({ rating: 5, title: '', comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="font-serif italic text-stone-500 text-lg">Retrieving from the archives...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Safe images extraction (array of Cloudinary image objects with url)
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://placehold.co/800x800?text=Heritage+Artifact' }];
  const displayPrice = product.finalPrice || product.price || 0;
  const artisanName = product.artisan?.shopName || product.artisan?.name || 'Master Artisan';

  return (
    <div className="min-h-screen bg-stone-50/50 relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Link to="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors font-serif italic mb-8 md:mb-12">
          <ArrowLeft className="w-4 h-4" /> Return to Gallery
        </Link>

        {/* Product E2E Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Image Canvas (lg:col-span-6) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Main Canvas Frame */}
            <div className="w-full aspect-square bg-white rounded-2xl border border-stone-200 overflow-hidden relative shadow-sm group p-4 flex items-center justify-center">
              <div className="w-full h-full relative overflow-hidden rounded-xl bg-stone-50 shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[activeImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover filter sepia-[0.05] hover:sepia-0 hover:scale-105 transition-all duration-700"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-white p-1 ${
                      activeImage === idx ? 'border-primary shadow-sm' : 'border-stone-200 hover:border-primary/50'
                    }`}
                  >
                    <img src={img?.url} alt="" className="w-full h-full object-cover rounded-md" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Curatorial Details (lg:col-span-6) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            className="lg:col-span-6 flex flex-col"
          >
            <div className="mb-6">
              {product.artisan?._id ? (
                <Link to={`/artisans/${product.artisan._id}`} className="inline-block text-primary font-serif italic text-lg hover:underline mb-2 font-semibold">
                  By {artisanName}
                </Link>
              ) : (
                <span className="inline-block text-primary font-serif italic text-lg mb-2 font-semibold">
                  By {artisanName}
                </span>
              )}

              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Reviews Summary */}
              {product.rating?.count > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(product.rating.average) ? 'fill-current' : 'text-stone-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-stone-600">
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-3xl font-serif font-bold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
              {product.price > displayPrice && (
                <>
                  <span className="text-lg font-serif text-stone-400 line-through mb-0.5">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5 mb-1 animate-pulse">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-base text-stone-600 font-serif leading-relaxed mb-8 bg-white p-5 border border-stone-100 rounded-xl shadow-sm">
              {product.description}
            </p>

            {/* Dynamic Metadata Attributes */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              {product.originState && (
                <div className="border border-stone-200/80 bg-white/60 p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Origin State</span>
                  <span className="font-serif font-semibold text-stone-800">{product.originState}</span>
                </div>
              )}
              {product.technique && (
                <div className="border border-stone-200/80 bg-white/60 p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Crafting Technique</span>
                  <span className="font-serif font-semibold text-stone-800">{product.technique}</span>
                </div>
              )}
              {product.craftingTime && (
                <div className="border border-stone-200/80 bg-white/60 p-3 rounded-lg flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Time to Weave/Carve</span>
                  <span className="font-serif font-semibold text-stone-800">{product.craftingTime}</span>
                </div>
              )}
              {product.giCertified && (
                <div className="border border-stone-200/80 bg-emerald-50/50 p-3 rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-serif font-bold text-emerald-800">GI Certified Heritage</span>
                </div>
              )}
            </div>

            {/* Authenticity Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-stone-100/60 p-3 rounded-lg border border-stone-200/60">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-serif font-bold text-stone-700">Verified Origin</span>
              </div>
              <div className="flex items-center gap-3 bg-stone-100/60 p-3 rounded-lg border border-stone-200/60">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-serif font-bold text-stone-700">100% Handcrafted</span>
              </div>
            </div>

            <HeritageDivider />

            {/* Acquisition Controls */}
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-stone-700">Edition Size</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} Available` : 'Sold Out / Out of Stock'}
                </span>
              </div>

              {product.stock > 0 ? (
                <div className="flex gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-white border border-stone-300 rounded-lg px-4 py-2 w-32 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(-1)} 
                      className="text-stone-400 hover:text-primary transition-colors disabled:opacity-50" 
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-serif font-bold text-lg text-stone-800">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(1)} 
                      className="text-stone-400 hover:text-primary transition-colors disabled:opacity-50" 
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 h-auto text-base font-serif font-bold rounded-lg border border-primary bg-primary text-white hover:bg-white hover:text-primary transition-all shadow-md flex items-center justify-center gap-3 py-3"
                  >
                    {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                    Add to Curation
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full h-auto text-base font-serif font-bold rounded-lg border border-stone-200 bg-stone-100 text-stone-400 py-3.5 cursor-not-allowed">
                  Currently Out of Stock
                </Button>
              )}
            </div>

            <div className="mt-8 flex items-start gap-3 text-sm text-stone-500 font-serif italic bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>This artifact ships directly from the artisan's rural studio. Please allow 5-7 business days for secure heritage packaging and carbon-neutral transit.</p>
            </div>

          </motion.div>
        </div>

        {/* REVIEWS & VERIFIED CRITIQUES SECTION */}
        <div className="mt-20 border-t border-stone-200 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Reviews List (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2 mb-6">
                <span>Verified Critiques</span>
                <span className="text-sm font-semibold bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              </h2>

              {reviews.length === 0 ? (
                <div className="p-8 bg-white border border-stone-100 rounded-xl text-center shadow-sm">
                  <p className="font-serif italic text-stone-400">No patron critiques have been registered for this masterpiece yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-6 bg-white border border-stone-100 rounded-xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img 
                            src={rev.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                            alt={rev.user?.name}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200 bg-stone-100"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-stone-800">{rev.user?.name || "Patron"}</h4>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="text-sm font-bold text-stone-900 font-serif">{rev.title}</h5>
                      )}
                      <p className="text-sm text-stone-600 leading-relaxed font-serif">{rev.comment}</p>
                      
                      {rev.isVerifiedPurchase && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                          <ShieldCheck className="w-3 h-3" /> Verified Purchase
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Review Form (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-serif font-bold text-stone-900 pb-2 border-b border-stone-100">
                  Register Your Critique
                </h3>

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 font-serif">
                    {/* Rating Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block font-sans">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                            className="text-amber-500 transition-transform active:scale-95"
                            aria-label={`Rate ${star} Stars`}
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= reviewFormData.rating ? 'fill-current' : 'text-stone-200'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block font-sans">
                        Critique Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Magnificent Weave, Exquisite Clay"
                        value={reviewFormData.title}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                        className="w-full bg-stone-50/50 border border-stone-200 focus:outline-none focus:border-primary text-sm rounded-lg px-3 py-2 text-stone-800"
                      />
                    </div>

                    {/* Review Comments */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block font-sans">
                        Comments & observations
                      </label>
                      <textarea
                        rows="4"
                        placeholder="Share your detailed analysis on craftsmanship, materials, colors, and textures..."
                        value={reviewFormData.comment}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                        required
                        className="w-full bg-stone-50/50 border border-stone-200 focus:outline-none focus:border-primary text-sm rounded-lg px-3 py-2 text-stone-800"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2.5 bg-primary text-white text-sm font-sans font-bold hover:bg-primary/95 transition-all shadow-md rounded-lg flex items-center justify-center gap-2"
                    >
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Submit Critique
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-stone-500 text-sm italic">
                      You must be logged in as an authenticated collector to submit reviews.
                    </p>
                    <Link
                      to={`/login?redirect=/products/${product._id}`}
                      className="inline-block px-5 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all font-sans"
                    >
                      Login to Rate
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}