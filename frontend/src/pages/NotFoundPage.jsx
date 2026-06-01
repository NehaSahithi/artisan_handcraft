import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const LotusMotif = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10 C30 30 10 50 10 70 C10 85 25 95 50 95 C75 95 90 85 90 70 C90 50 70 30 50 10 Z M50 25 C65 45 75 60 75 70 C75 80 65 85 50 85 C35 85 25 80 25 70 C25 60 35 45 50 25 Z"/>
    <path d="M20 60 C5 70 0 85 10 95 C25 90 35 75 40 60 C25 55 10 60 20 60 Z"/>
    <path d="M80 60 C95 70 100 85 90 95 C75 90 65 75 60 60 C75 55 90 60 80 60 Z"/>
  </svg>
);

const BlockPrintPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0 fixed" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley-404" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 10 C45 10 50 25 45 35 C40 45 25 50 20 40 C15 30 20 15 30 10 Z" fill="currentColor" />
        <circle cx="30" cy="25" r="4" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#paisley-404)" />
  </svg>
);

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50/50 relative flex items-center justify-center p-6 font-sans selection:bg-primary/20 selection:text-primary">
      <BlockPrintPattern />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="text-center max-w-md bg-white border border-stone-200 p-8 md:p-12 rounded-2xl shadow-sm relative z-10"
      >
        <div className="w-20 h-20 mx-auto border border-primary/20 rounded-t-full bg-stone-50 flex items-center justify-center mb-8 shadow-inner">
          <LotusMotif className="w-10 h-10 text-primary opacity-45 animate-pulse" />
        </div>
        
        <h1 className="text-6xl font-serif font-bold text-stone-900 mb-2">404</h1>
        <p className="text-xl font-serif text-primary italic mb-4">Lost in the Archives</p>
        
        <p className="text-sm text-stone-500 font-serif leading-relaxed mb-8">
          The specific cultural artifact or private studio configuration you are searching for does not exist in our heritage registry.
        </p>
        
        <Link to="/" className="inline-block w-full">
          <Button className="w-full py-3 bg-primary text-white hover:bg-primary/95 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to the Gallery
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
