import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../lib/apiClient'
import ProductCard from '../components/product/ProductCard'
import { 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  Award, 
  Calendar, 
  Palette,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// --- REUSABLE HERITAGE ELEMENTS ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg className="inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0" style={{ position: 'absolute' }} xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-artisan" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-artisan)" />
  </svg>
)

const HeritageDivider = () => (
  <div className="flex items-center justify-center w-full my-12 opacity-30">
    <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-primary to-transparent" />
    <LotusMotif className="w-5 h-5 text-primary mx-6 flex-shrink-0" />
    <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
)

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
}

export default function ArtisanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [artisan, setArtisan] = useState(null)
  const [artisanProducts, setArtisanProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        // Parallel fetching to speed up page load
        // Note: Using standard public routes. Adjust if your backend uses different paths.
        const [artisanRes, productsRes] = await Promise.all([
          apiClient.get(`/artisans/${id}`),
          apiClient.get(`/products/artisan/${id}`)
        ])

        const artisanProfile = artisanRes.data?.artisan || artisanRes.data
        const artisanData = artisanProfile?.user
          ? { ...artisanProfile, ...artisanProfile.user }
          : artisanProfile
        const productsData = productsRes.data?.products || productsRes.data || []

        setArtisan(artisanData)
        
        // Ensure we only show products belonging to this specific artisan
        const filteredProducts = Array.isArray(productsData) 
          ? productsData.filter(p => p.artisan?._id === id || p.artisan === id)
          : []
        
        setArtisanProducts(filteredProducts)
      } catch (error) {
        console.error("Artisan profile fetch error:", error)
        toast.error("The artisan's studio could not be located.")
        navigate('/artisans')
      } finally {
        setLoading(false)
      }
    }

    fetchArtisanData()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-12 px-4 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
        <p className="font-serif italic text-muted-foreground text-lg">Traveling to the Karigar's studio...</p>
      </div>
    )
  }

  if (!artisan) return null

  // Fallback data preparation
  const artisanName = artisan.name || "Master Artisan"
  const shopName = artisan.shopName || `${artisanName}'s Studio`
  const profileImage = artisan.profileImage || 'https://placehold.co/600x600?text=Karigar'
  const coverImage = artisan.coverImage || 'https://images.unsplash.com/photo-1605814589255-6cb312e4f0dc?q=80&w=2000&auto=format&fit=crop'

  return (
    <div className="min-h-screen bg-background relative font-sans selection:bg-primary/20 selection:text-primary pb-20">
      <BlockPrintPattern />

      {/* EDITORIAL HERO BANNER */}
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
        <img 
          src={coverImage} 
          alt="Studio Background" 
          className="w-full h-full object-cover filter sepia-[0.2]"
        />
        
        {/* Navigation back (layered over banner) */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
          <Link to="/artisans" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-serif italic drop-shadow-md">
            <ArrowLeft className="w-5 h-5" /> Return to Artisans
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32 md:-mt-48">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* PROFILE PORTRAIT */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-background overflow-hidden shadow-2xl bg-secondary relative">
              <img 
                src={profileImage} 
                alt={artisanName}
                className="w-full h-full object-cover filter sepia-[0.1]"
              />
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full pointer-events-none" />
            </div>
          </motion.div>

          {/* STUDIO METADATA */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-grow pt-4 md:pt-36"
          >
            <div className="bg-card border border-border p-8 rounded-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2">
                    {shopName}
                  </h1>
                  <p className="text-xl text-primary font-serif italic">
                    Guided by {artisanName}
                  </p>
                </div>
                
                {/* Verification Badge */}
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-wide uppercase font-serif">Verified Artisan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Region</span>
                  </div>
                  <p className="font-serif text-foreground">{artisan.city || artisan.state || "Rural India"}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Legacy</span>
                  </div>
                  <p className="font-serif text-foreground">{artisan.experience ? `${artisan.experience} Years` : "Generational"}</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Palette className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Mastery</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artisan.craftCategories?.length > 0 ? (
                      artisan.craftCategories.map((craft, idx) => (
                        <span key={idx} className="bg-secondary px-3 py-1 rounded-sm text-sm font-serif border border-border">
                          {craft}
                        </span>
                      ))
                    ) : (
                      <span className="bg-secondary px-3 py-1 rounded-sm text-sm font-serif border border-border">Traditional Handicrafts</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* THE ARTISAN'S STORY */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-20 max-w-4xl mx-auto text-center"
        >
          <LotusMotif className="w-12 h-12 text-primary/40 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8">The Heritage Story</h2>
          <p className="text-lg md:text-xl text-muted-foreground font-serif leading-relaxed italic">
            "{artisan.bio || artisan.description || `For generations, the hands of ${artisanName} have shaped raw materials into breathtaking pieces of cultural history. Operating out of their traditional studio space, every creation tells a story of patience, ancestral knowledge, and deep reverence for the craft.`}"
          </p>
        </motion.div>

        <HeritageDivider />

        {/* ARTISAN'S SPECIFIC GALLERY */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">The Collection</h2>
              <p className="text-muted-foreground font-serif italic">Artifacts currently available from this studio.</p>
            </div>
            <Award className="w-8 h-8 text-primary opacity-50" />
          </div>

          {artisanProducts.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border">
              <p className="text-xl font-serif text-foreground mb-2">The studio is currently empty.</p>
              <p className="text-muted-foreground font-serif italic">The artisan is hard at work on new creations. Please check back later.</p>
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
                  <motion.div key={product._id} variants={itemVariants} layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}