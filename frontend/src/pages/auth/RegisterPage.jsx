import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2, Paintbrush } from 'lucide-react'
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
    <defs><pattern id="paisley-reg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" /><circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-reg)" />
  </svg>
)

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated, user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' // Default role
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'artisan') navigate('/seller/dashboard')
      else navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register(formData);
      const isArtisan = (registeredUser?.role || formData.role) === 'artisan';
      toast.success(isArtisan ? "Welcome, Master Artisan. Please set up your Studio Profile." : "Welcome to the Curation.");
      navigate(isArtisan ? '/seller/settings' : '/products');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      
      // Map common backend errors to inline fields
      if (errorMsg.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("password")) {
        setErrors(prev => ({ ...prev, password: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("name")) {
        setErrors(prev => ({ ...prev, name: errorMsg }));
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* LEFT SIDE: The Art Gallery (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1A1A]">
        <motion.img 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1610224217112-a8cdd8d95195?q=80&w=1200" 
          alt="Artisan Pottery" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] sepia-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 text-white">
          <LotusMotif className="w-12 h-12 text-accent mb-6" />
          <h2 className="text-5xl font-serif font-bold mb-4 leading-tight">
            Join the Legacy.
          </h2>
          <p className="text-lg text-white/70 font-serif italic max-w-md border-l-2 border-accent pl-4">
            "We do not just create objects; we breathe life into the earth, preserving stories for generations to come."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <BlockPrintPattern />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-secondary mx-auto shadow-inner">
                <LotusMotif className="w-6 h-6 text-primary" />
              </div>
            </Link>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Begin Your Journey</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Elegant Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'buyer'})}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.role === 'buyer' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border bg-transparent text-muted-foreground hover:border-primary/30'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="font-serif font-bold">Collector</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'artisan'})}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.role === 'artisan' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border bg-transparent text-muted-foreground hover:border-primary/30'
                }`}
              >
                <Paintbrush className="w-6 h-6" />
                <span className="font-serif font-bold">Karigar</span>
              </button>
            </div>

            {/* Editorial Style Inputs */}
            <div className="space-y-6">
              <div className="group relative">
                <User className={`absolute left-0 top-3 w-5 h-5 transition-colors ${errors.name ? 'text-red-500 font-bold' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Full Name" 
                  required
                  className={`w-full bg-transparent border-b-2 outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all ${
                    errors.name 
                      ? 'border-red-500 focus:border-red-650' 
                      : 'border-border focus:border-primary'
                  }`} 
                />
                {errors.name && (
                  <p className="text-red-500 text-xs font-serif italic mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="group relative">
                <Mail className={`absolute left-0 top-3 w-5 h-5 transition-colors ${errors.email ? 'text-red-500 font-bold' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Email Address" 
                  required
                  className={`w-full bg-transparent border-b-2 outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-650' 
                      : 'border-border focus:border-primary'
                  }`} 
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-serif italic mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="group relative">
                <Lock className={`absolute left-0 top-3 w-5 h-5 transition-colors ${errors.password ? 'text-red-500 font-bold' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Password" 
                  required
                  className={`w-full bg-transparent border-b-2 outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-650' 
                      : 'border-border focus:border-primary'
                  }`} 
                />
                {errors.password && (
                  <p className="text-red-500 text-xs font-serif italic mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="group relative">
                <Lock className={`absolute left-0 top-3 w-5 h-5 transition-colors ${errors.confirmPassword ? 'text-red-500 font-bold' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="Confirm Password" 
                  required
                  className={`w-full bg-transparent border-b-2 outline-none py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-650' 
                      : 'border-border focus:border-primary'
                  }`} 
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-serif italic mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 mt-4 text-lg font-serif font-bold rounded-sm border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Weaving...</> : <>Join the Curation <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm font-serif">
              Already a patron?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In here</Link>
            </p>
          </div>
        </motion.div>
      </div>
      
    </div>
  )
}