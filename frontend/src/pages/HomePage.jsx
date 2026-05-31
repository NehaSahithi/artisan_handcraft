import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useProductStore } from '../store/productStore'
import { useArtisanStore } from '../store/artisanStore'
import ProductCard from '../components/product/ProductCard'
import { ArrowRight, MapPin } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

// --- THEME & SVG COMPONENTS (Kept from previous) ---
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

// 1. ADVANCED SVG PATH ANIMATION: The Rangoli Loader
const HeritageLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 bg-background">
    <motion.svg 
      viewBox="0 0 100 100" 
      className="w-20 h-20 text-primary drop-shadow-md"
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { 
            pathLength: 1, 
            opacity: 1, 
            transition: { pathLength: { duration: 2, repeat: Infinity, ease: "easeInOut" } } 
          }
        }}
      />
      <motion.circle 
        cx="50" cy="50" r="10" 
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
      />
    </motion.svg>
    <p className="mt-6 font-serif text-primary text-sm tracking-widest uppercase animate-pulse">
      Weaving Heritage...
    </p>
  </div>
)

// 2. TRADITIONAL SECTION DIVIDER
const TempleDivider = () => (
  <div className="flex items-center justify-center w-full my-20 opacity-40">
    <div className="h-[1px] w-1/3 bg-gradient-to-r from-transparent to-primary" />
    <div className="px-4 flex gap-2 text-primary">
      <div className="w-2 h-2 rotate-45 bg-primary" />
      <div className="w-3 h-3 rotate-45 bg-primary" />
      <div className="w-2 h-2 rotate-45 bg-primary" />
    </div>
    <div className="h-[1px] w-1/3 bg-gradient-to-l from-transparent to-primary" />
  </div>
)
const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley)" />
  </svg>
)

// --- ADVANCED CUSTOM CURSOR (Bindi & Brass Style) ---
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY })
    const handleMouseOver = (e) => {
      // Check if hovering over a link or button
      if (e.target.closest('a') || e.target.closest('button')) setIsHovering(true)
      else setIsHovering(false)
    }
    
    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <>
      {/* 1. The Core Dot (Bindi - Terracotta Red) - Moves instantly */}
      <motion.div 
        className="fixed top-0 left-0 w-2 h-2 bg-[#8C3A3A] rounded-full pointer-events-none z-[100] shadow-sm"
        animate={{ x: mousePosition.x - 4, y: mousePosition.y - 4 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }} 
      />
      
      {/* 2. The Trailing Ring (Temple Brass) - Moves smoothly with physics */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 border-[1.5px] border-[#B8860B] rounded-full pointer-events-none z-[99] flex items-center justify-center backdrop-blur-[1px]"
        animate={{ 
          x: mousePosition.x - 16, 
          y: mousePosition.y - 16, 
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? 'rgba(184, 134, 11, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(184, 134, 11, 0.4)' : 'rgba(184, 134, 11, 0.8)'
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.2 }}
      >
        {/* Lotus only appears when hovering over a button/link */}
        {isHovering && <LotusMotif className="w-4 h-4 text-[#B8860B] animate-spin-slow opacity-90" />}
      </motion.div>
    </>
  )
}
// --- HORIZONTAL SCROLL GALLERY COMPONENT ---
const HorizontalGallery = ({ products, loading }) => {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: targetRef })
  
  // Convert vertical scroll into horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"])
  
  return (
    <section ref={targetRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Title pinned to the left */}
        <div className="absolute left-8 md:left-16 z-20 top-1/4">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4">
            The <br/><span className="text-primary italic">Gallery.</span>
          </h2>
          <div className="w-24 h-1 bg-primary rounded-full mb-6" />
          <p className="text-muted-foreground font-serif text-lg max-w-xs">
            Scroll to wander through our curated collection of national masterpieces.
          </p>
        </div>

        {/* The horizontally moving track */}
        <motion.div style={{ x }} className="flex gap-8 pl-[30vw] md:pl-[40vw] pr-[20vw]">
          {loading ? (
             [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-[300px] md:w-[400px] flex-shrink-0">
                <Skeleton className="h-[500px] w-full rounded-t-full rounded-b-md" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product._id} className="w-[300px] md:w-[400px] flex-shrink-0 group">
                <div className="h-[500px]">
                  <ProductCard product={product} />
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { getProducts, products } = useProductStore()
  const { getArtisans, artisans } = useArtisanStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hide default cursor for the whole app when on homepage
    document.body.style.cursor = 'none'
    const loadData = async () => {
      try {
        await Promise.all([getProducts({ limit: 10, isFeatured: true }), getArtisans({ limit: 3 })])
      } catch (error) { console.error(error) } finally { setLoading(false) }
    }
    loadData()
    return () => { document.body.style.cursor = 'auto' }
  }, [])

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary/20 selection:text-primary">
      <CustomCursor />
      <BlockPrintPattern />
      
      {/* 1. TRADITIONAL INDIAN HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden border-b-[8px] border-double border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 text-primary">
              <LotusMotif className="w-6 h-6" />
              <span className="text-sm font-semibold tracking-widest uppercase">Timeless Heritage</span>
              <LotusMotif className="w-6 h-6" />
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 text-foreground leading-[1.1]">
              The Art of <br />
              <span className="text-primary italic">Bharat.</span>
            </h1>
            
            <p className="text-xl mb-10 text-muted-foreground font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
              Discover authentic Madhubani, handcrafted Dhokra, and rich Kanjeevaram weaves. Directly from the hands of India's master artisans.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products" className="px-8 py-4 bg-primary text-primary-foreground text-lg font-serif font-bold rounded-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 border-2 border-primary">
                Explore The Arts <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative hidden md:block">
            <div className="relative w-full aspect-[3/4] p-4 bg-secondary border border-border shadow-2xl rounded-t-[50%] overflow-hidden">
              <div className="w-full h-full rounded-t-[50%] overflow-hidden border-4 border-background relative">
                <motion.img 
                  initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000" 
                  alt="Indian Artisan" 
                  className="w-full h-full object-cover filter brightness-90"
                />
              </div>
            </div>
            <LotusMotif className="absolute -top-4 -right-4 w-16 h-16 text-accent drop-shadow-md animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* 2. DISCOVER CRAFTS (Standard Scroll) */}
      <section className="py-32 bg-background relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Discover Regional Crafts</h2>
          <div className="flex items-center justify-center gap-4 text-primary">
            <div className="h-[1px] w-12 bg-primary/40" />
            <LotusMotif className="w-6 h-6" />
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Kalamkari", origin: "Andhra Pradesh", img: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800", color: "bg-[#8C3A3A]" },
            { title: "Dhokra Metal", origin: "Chhattisgarh", img: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&q=80&w=800", color: "bg-[#B8860B]" },
            { title: "Blue Pottery", origin: "Jaipur", img: "https://images.unsplash.com/photo-1601922187018-7b9894e6bf7f?auto=format&fit=crop&q=80&w=800", color: "bg-[#2A4B7C]" },
            { title: "Wood Carving", origin: "Saharanpur", img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800", color: "bg-[#5C4033]" },
          ].map((art, idx) => (
            <Link key={idx} to={`/products?category=${art.title}`} className="group relative h-[400px] rounded-t-full rounded-b-md overflow-hidden border border-border shadow-sm block bg-secondary p-2">
              <div className="w-full h-full rounded-t-full rounded-b-sm overflow-hidden relative">
                <img src={art.img} alt={art.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 filter brightness-75 group-hover:brightness-100" />
                <div className={`absolute bottom-0 w-full p-6 text-center ${art.color}/90 backdrop-blur-sm border-t-2 border-accent/50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500`}>
                  <h3 className="font-serif text-xl font-bold text-white mb-1">{art.title}</h3>
                  <p className="text-white/80 text-sm flex justify-center items-center gap-1"><MapPin className="w-3 h-3"/> {art.origin}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. THE MUSEUM WALK (Horizontal Scroll) */}
      <HorizontalGallery products={products} loading={loading} />

    </div>
  )
}
// I have updated the placeholder URLs with targeted high-quality image assets from Unsplash that accurately match the theme of traditional Indian arts, heritage, and crafts:

// Hero Image Line 181: Swapped the broken placeholder image with a striking portrait of a traditional Indian artisan hand-weaving textiles (photo-1617627143750-d86bc21e42bb).

// Kalamkari Line 202: Updated to a detailed view of intricate hand-printed Indian textile patterns (photo-1584551246679-0daf3d275d0f).

// Dhokra Metal Line 203: Updated to a focus shot of rustic traditional metal and brass handiwork (photo-1615486511484-92e172cc4fe0).

// Blue Pottery Line 204: Updated to an asset highlighting traditional hand-painted floral ceramics and clay plates (photo-1601922187018-7b9894e6bf7f).

// Wood Carving Line 205: Updated to a macro shot capturing the rich textures of manually carved wood detailing (photo-1563245372-f21724e3856d).

// All functional logic, Framer Motion animations, tailwind configurations, and component architecture remain exactly as you wrote them.