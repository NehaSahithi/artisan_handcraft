import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtisanStore } from '../store/artisanStore';
import ProductCard from '../components/product/ProductCard';
import { 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  Award, 
  Calendar, 
  Palette,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg className="inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0" style={{ position: 'absolute' }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley-artisan" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-artisan)" />
  </svg>
);

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-12 opacity-30">
    <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-5 h-5 text-primary mx-6 flex-shrink-0" />
    <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
};

export default function ArtisanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getArtisan, artisan, artisanProducts, loading } = useArtisanStore();

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        await getArtisan(id);
      } catch (error) {
        console.error("Artisan profile fetch error:", error);
        toast.error("The artisan's studio could not be located.");
        navigate('/artisans');
      }
    };

    fetchArtisanData();
  }, [id, navigate, getArtisan]);

  if (loading && !artisan) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-12 px-4 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
        <p className="font-serif italic text-stone-500 text-lg">Traveling to the Karigar's studio...</p>
      </div>
    );
  }

  if (!artisan) return null;

  const artisanName = artisan.user?.name || artisan.name || "Master Artisan";
  const shopName = artisan.shopName || `${artisanName}'s Studio`;
  const profileImage = artisan.shopLogo || artisan.user?.avatar || 'https://placehold.co/600x600?text=Karigar';
  const coverImage = artisan.shopBanner || 'https://images.unsplash.com/photo-1605814589255-6cb312e4f0dc?q=80&w=2000&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-stone-50/50 relative font-sans selection:bg-primary/20 selection:text-primary pb-20">
      <BlockPrintPattern />

      {/* EDITORIAL HERO BANNER */}
      <div className="relative h-[35vh] md:h-[48vh] w-full overflow-hidden bg-stone-900 border-b-2 border-stone-200">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          src={coverImage} 
          alt="Studio Background" 
          className="w-full h-full object-cover filter sepia-[0.15] brightness-90"
        />
        
        {/* Navigation back */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
          <Link to="/artisans" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-serif italic drop-shadow-md">
            <ArrowLeft className="w-5 h-5" /> Return to Artisans
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24 md:-mt-36">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* PROFILE PORTRAIT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0 mx-auto lg:mx-0"
          >
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white overflow-hidden shadow-xl bg-stone-100 relative p-1">
              <img 
                src={profileImage} 
                alt={artisanName}
                className="w-full h-full object-cover rounded-full filter sepia-[0.05]"
              />
            </div>
          </motion.div>

          {/* STUDIO METADATA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-grow pt-4 lg:pt-20 w-full"
          >
            <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-1 leading-tight">
                    {shopName}
                  </h1>
                  {artisan.tagline && (
                    <p className="text-stone-500 font-serif italic mb-2 text-sm">
                      "{artisan.tagline}"
                    </p>
                  )}
                  <p className="text-base text-primary font-serif italic font-semibold">
                    Guided by {artisanName}
                  </p>
                </div>
                
                {/* Verification Badge */}
                {artisan.isVerified && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-wider uppercase font-serif">Verified Karigar</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <MapPin className="w-3.5 h-3.5" /> 
                    <span className="text-[10px] uppercase font-bold tracking-wider">Region</span>
                  </div>
                  <p className="font-serif text-stone-800 text-sm">
                    {[artisan.location?.village, artisan.location?.district, artisan.location?.state].filter(Boolean).join(', ') || 'Rural India'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Calendar className="w-3.5 h-3.5" /> 
                    <span className="text-[10px] uppercase font-bold tracking-wider">Legacy</span>
                  </div>
                  <p className="font-serif text-stone-800 text-sm">
                    {artisan.yearsOfExperience ? `${artisan.yearsOfExperience} Years` : "Generational Master"}
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Palette className="w-3.5 h-3.5" /> 
                    <span className="text-[10px] uppercase font-bold tracking-wider">Mastery Area</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {artisan.craftCategories?.length > 0 ? (
                      artisan.craftCategories.map((craft, idx) => (
                        <span key={idx} className="bg-stone-50 text-stone-700 px-2.5 py-0.5 rounded text-xs font-serif border border-stone-200">
                          {craft}
                        </span>
                      ))
                    ) : (
                      <span className="bg-stone-50 text-stone-700 px-2.5 py-0.5 rounded text-xs font-serif border border-stone-200">Traditional Handicrafts</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* THE ARTISAN'S STORY */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="my-20 max-w-4xl mx-auto text-center"
        >
          <LotusMotif className="w-10 h-10 text-primary/30 mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">The Heritage Story</h2>
          
          <div className="bg-white border border-stone-150 p-8 rounded-2xl shadow-sm space-y-4">
            <p className="text-base md:text-lg text-stone-600 font-serif leading-relaxed italic">
              "{artisan.story || `For generations, the hands of our master artisan have shaped raw materials into breathtaking pieces of cultural history. Operating out of their traditional studio space, every creation tells a story of patience, ancestral knowledge, and deep reverence for the craft.`}"
            </p>
            {artisan.craftTradition && (
              <div className="pt-4 border-t border-stone-100 mt-4 text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 font-sans block mb-1">Traditional Practice</span>
                <p className="text-sm text-stone-600 leading-relaxed font-serif">{artisan.craftTradition}</p>
              </div>
            )}
          </div>
        </motion.div>

        <HeritageDivider />

        {/* ARTISAN'S SPECIFIC GALLERY */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">The Studio Collection</h2>
              <p className="text-stone-500 font-serif italic text-sm">Handcrafted masterpieces currently available from this studio.</p>
            </div>
            <Award className="w-8 h-8 text-primary opacity-30" />
          </div>

          {artisanProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <LotusMotif className="w-12 h-12 text-primary/10 mx-auto mb-4" />
              <p className="text-lg font-serif text-stone-800 mb-1">The studio is currently quiet.</p>
              <p className="text-stone-500 font-serif italic text-sm">The artisan is currently hard at work weaving, sculpting, or engraving. Stay tuned for new releases!</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12"
            >
              <AnimatePresence>
                {artisanProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants} layout className="h-full">
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}