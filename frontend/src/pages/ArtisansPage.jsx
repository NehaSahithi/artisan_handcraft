import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useArtisanStore } from '../store/artisanStore'
import { MapPin, Award, ArrowRight, Paintbrush } from 'lucide-react'

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
    <defs><pattern id="paisley-artisans" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-artisans)" />
  </svg>
)

const HeritageLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 relative z-10">
    <motion.svg viewBox="0 0 100 100" className="w-20 h-20 text-primary drop-shadow-md" initial="hidden" animate="visible">
      <motion.path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="transparent" stroke="currentColor" strokeWidth="2"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 2, repeat: Infinity, ease: "easeInOut" } } } }} />
      <motion.circle cx="50" cy="50" r="10" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }} />
    </motion.svg>
    <p className="mt-6 font-serif text-primary text-sm tracking-widest uppercase animate-pulse">Gathering the Masters...</p>
  </div>
)

// --- MAIN COMPONENT ---
export default function ArtisansPage() {
  const { getArtisans, artisans } = useArtisanStore()
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  // Extract unique craft categories for the filter buttons
  const categories = ['All', ...new Set(artisans.flatMap(a => a.craftCategories || []).filter(Boolean))]

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        await getArtisans()
      } catch (error) {
        console.error("Error fetching artisans:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMasters()
  }, [getArtisans])

  const filteredArtisans = activeFilter === 'All' 
    ? artisans 
    : artisans.filter(artisan => artisan.craftCategories?.includes(activeFilter))

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary pb-24">
      <BlockPrintPattern />

      {/* HEADER SECTION */}
      <section className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 mb-6 text-primary">
            <LotusMotif className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-widest uppercase">The Creators</span>
            <LotusMotif className="w-6 h-6" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-foreground">
            Master <span className="text-primary italic">Karigars.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-serif max-w-2xl mx-auto italic">
            Meet the guardians of India's cultural legacy. Every artisan here has dedicated their life to mastering techniques passed down through generations.
          </p>
        </motion.div>
      </section>

      {/* FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2.5 rounded-full font-serif text-sm md:text-base border transition-all duration-300 ${
                activeFilter === category
                  ? 'bg-primary border-primary text-primary-foreground shadow-md'
                  : 'bg-secondary border-border text-foreground hover:border-primary/50 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* ARTISAN GALLERY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {loading ? (
          <HeritageLoader />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredArtisans.length > 0 ? (
                filteredArtisans.map((artisan, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    key={artisan._id}
                    className="group"
                  >
                    <Link to={`/artisans/${artisan._id}`} className="block h-full bg-secondary border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-t-[40%] rounded-b-xl overflow-hidden relative">
                      
                      {/* Image Block (Arch Style) */}
                      <div className="w-full aspect-square relative overflow-hidden border-b-4 border-background">
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay" />
                        <img 
                          src={artisan.profileImage || 'https://placehold.co/600x600?text=Master+Artisan'} 
                          alt={artisan.name}
                          className="w-full h-full object-cover filter sepia-[0.3] group-hover:sepia-0 group-hover:scale-110 transition-all duration-700"
                        />
                        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2">
                          {artisan.craftCategories?.slice(0, 2).map(craft => (
                            <span key={craft} className="px-3 py-1 bg-background/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider rounded-sm border border-primary/20">
                              {craft}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Content Block */}
                      <div className="p-8 text-center bg-secondary relative">
                        {/* Decorative background logo */}
                        <Paintbrush className="absolute right-4 bottom-4 w-24 h-24 text-border opacity-20 transform -rotate-12 group-hover:rotate-0 group-hover:text-primary/10 transition-all duration-700" />
                        
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {artisan.shopName || artisan.name}
                        </h2>
                        <p className="text-muted-foreground font-serif italic mb-6">by {artisan.name}</p>
                        
                        <div className="flex justify-center gap-6 text-sm text-foreground mb-8 border-y border-border py-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary" />
                            {artisan.state || 'India'}
                          </div>
                          <div className="w-px h-4 bg-border" />
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-primary" />
                            {artisan.experience ? `${artisan.experience} Yrs` : 'Master'}
                          </div>
                        </div>

                        <div className="inline-flex items-center justify-center gap-2 text-primary font-serif font-bold text-lg group-hover:gap-4 transition-all">
                          Enter Studio <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-2xl font-serif text-muted-foreground italic">No artisans found practicing this craft yet.</p>
                  <button onClick={() => setActiveFilter('All')} className="mt-4 text-primary underline underline-offset-4">View all masters</button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}