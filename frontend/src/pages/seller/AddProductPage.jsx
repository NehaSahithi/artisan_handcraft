import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../../lib/apiClient'
import { ArrowLeft, Loader2, Package, Sparkles, Image, IndianRupee, Tag, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from "@/components/ui/button"

// Reusable Heritage Elements
const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
)

const BlockPrintPattern = () => (
  <svg
    className="inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
    style={{ position: 'absolute' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs><pattern id="paisley-addproduct" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-addproduct)" />
  </svg>
)

export default function AddProductPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Pottery',
    price: '',
    stock: '',
    imageUrl: '',
    discount: 0
  })

  const categories = [
    'Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting',
    'Embroidery', 'Metalwork', 'Leatherwork', 'Bamboo & Cane',
    'Stone Carving', 'Terracotta', 'Block Printing', 'Dhokra',
    'Warli Art', 'Madhubani', 'Pattachitra'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' || name === 'discount' ? (value === '' ? '' : Number(value)) : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.imageUrl) {
      return toast.error("Please fill out the product form completely.")
    }

    setLoading(true)
    try {
      const response = await apiClient.post('/products', formData)
      if (response.data?.success) {
        toast.success("Artifact added successfully!")
        navigate('/seller/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add artifact to studio catalog.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative py-12 md:py-20 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-serif italic mb-8">
          <ArrowLeft className="w-4 h-4" /> Return to Studio
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-secondary shadow-inner">
            <LotusMotif className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Add New Artifact</h1>
            <p className="text-muted-foreground font-serif italic text-sm">Introduce a new masterpiece to the collector gallery.</p>
          </div>
          <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/30 to-transparent mt-2 hidden sm:block" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background element */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Artifact Title
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Blue Pottery Vase" 
                  required
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {/* Category select */}
              <div className="space-y-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Craft Tradition
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground transition-all cursor-pointer font-serif"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-card text-foreground py-2 font-serif">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" /> Contribution Value (Price)
                </label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="₹ Value" 
                  min="1"
                  required
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {/* Stock Count */}
              <div className="space-y-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Stock Count
                </label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  placeholder="Pieces Available" 
                  min="0"
                  required
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" /> Masterpiece Image URL
                </label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://images.unsplash.com/... or similar" 
                  required
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground placeholder:text-muted-foreground transition-all"
                />
                <p className="text-xs text-muted-foreground font-serif italic mt-1">Provide a high-quality online image link representing this cultural artifact.</p>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                  Heritage Story (Description)
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Describe the craft tradition, materials used, time taken, and the story woven into this artifact..." 
                  rows="4"
                  required
                  className="w-full bg-transparent border border-border rounded-md focus:border-primary outline-none p-3 text-foreground placeholder:text-muted-foreground transition-all font-serif"
                />
              </div>

            </div>

            <div className="pt-4 flex justify-end gap-4 border-t border-border">
              <Link to="/seller/dashboard">
                <Button type="button" variant="outline" className="font-serif tracking-wide rounded-sm border-border hover:bg-secondary">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="font-serif tracking-wide rounded-sm bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-2 px-8"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Submit/Create</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
