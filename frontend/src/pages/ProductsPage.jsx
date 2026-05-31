import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductStore } from '../store/productStore'
import ProductCard from '../components/product/ProductCard' // Your existing beautiful card
import { Search, SlidersHorizontal, Loader2, MapPin } from 'lucide-react'

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
    <defs><pattern id="paisley-gallery" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-gallery)" />
  </svg>
)

const categories = [
  "All Heritage", 
  "Textiles & Weaves", 
  "Pottery & Ceramics", 
  "Brass & Metalcraft", 
  "Wood Carvings", 
  "Tribal Paintings",
  "Jewelry"
]

// Framer Motion Variants for Staggered Stepwell Effect
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
}

export default function ProductsPage() {
  const { products, getProducts, loading } = useProductStore()
  
  const [activeCategory, setActiveCategory] = useState("All Heritage")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch products on mount. Assuming your store handles the API call.
    getProducts()
  }, [getProducts])

  // Front-end filtering logic
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All Heritage" || product.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* EDITORIAL HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <LotusMotif className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-widest uppercase">Curated Collection</span>
            <LotusMotif className="w-5 h-5" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            The Artisan <span className="text-primary italic">Gallery</span>
          </h1>
          <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
            Discover authentic, handcrafted masterpieces directly from the master artisans of India. Every piece carries the soul of its creator and the legacy of its region.
          </p>
        </motion.div>

        {/* CONTROLS (Search & Filter) */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border">
            
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search artifacts, crafts, or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3 pl-11 pr-4 outline-none transition-all font-serif"
              />
            </div>

            {/* Visual Balance Element */}
            <div className="hidden md:flex items-center gap-2 text-muted-foreground font-serif text-sm">
              <SlidersHorizontal className="w-4 h-4" /> 
              <span>Curate by Craft</span>
            </div>
          </div>

          {/* Stamped Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-serif text-sm transition-all duration-300 border ${
                  activeCategory === cat 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="font-serif italic text-muted-foreground text-lg">Curating the gallery...</p>
          </div>
        ) : filteredProducts?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="text-center py-24 bg-card border border-border rounded-2xl shadow-sm"
          >
            <LotusMotif className="w-16 h-16 text-primary/20 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No Artifacts Found</h3>
            <p className="text-muted-foreground font-serif italic max-w-md mx-auto">
              The specific cultural artifacts you are searching for are currently not in our archive.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All Heritage"); }}
              className="mt-8 px-6 py-2 border-2 border-primary text-primary font-bold font-serif hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Reset Curation
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12"
          >
            <AnimatePresence>
              {filteredProducts?.map((product) => (
                <motion.div key={product._id} variants={itemVariants} layout>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}