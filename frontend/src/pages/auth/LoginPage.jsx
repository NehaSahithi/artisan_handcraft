import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from "../../store/authStore";
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
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
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="paisley-login" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-login)" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'artisan') {
        navigate('/seller/dashboard')
      } else {
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all fields")
    }

    setLoading(true)
    try {
      const authenticatedUser = await login(formData.email, formData.password)
      toast.success("Welcome back to the Curation.")
      
      // Route based on role
      if (authenticatedUser.role === 'admin') navigate('/admin/dashboard')
      else if (authenticatedUser.role === 'artisan') navigate('/seller/dashboard')
      else navigate('/')
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* LEFT SIDE: The Art Gallery (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1A1A]">
        {/* Subtle pan animation on the background image */}
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1605001011155-22d25087eb41?q=80&w=1200" 
          alt="Artisan Weaving" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] sepia-[0.2]"
        />
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white">
          <LotusMotif className="w-12 h-12 text-accent mb-6" />
          <h2 className="text-5xl font-serif font-bold mb-4 leading-tight">
            Preserving the <br/> Soul of India.
          </h2>
          <p className="text-lg text-white/70 font-serif italic max-w-md border-l-2 border-accent pl-4">
            "Every thread woven, every block pressed, carries the weight of a thousand years of history."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <BlockPrintPattern />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-secondary mx-auto shadow-inner">
                <LotusMotif className="w-6 h-6 text-primary" />
              </div>
            </Link>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-serif italic">Enter the Curation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Editorial Style Input - Email */}
            <div className="group relative">
              <Mail className="absolute left-0 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all peer"
                required
              />
            </div>

            {/* Editorial Style Input - Password */}
            <div className="group relative">
              <Lock className="absolute left-0 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all peer"
                required
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-serif italic text-muted-foreground hover:text-primary transition-colors">
                Lost your keys?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 text-lg font-serif font-bold rounded-sm border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <>Enter <ArrowRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm font-serif">
              New to the Gallery?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      
    </div>
  )
}