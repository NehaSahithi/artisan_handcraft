import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { LotusMotif } from '../common/Heritage';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t-2 border-primary/20 pt-16 pb-8 mt-24 relative overflow-hidden font-sans">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <LotusMotif className="w-8 h-8 text-primary group-hover:scale-105 transition-all duration-300" />
              <span className="text-2xl font-serif font-bold tracking-tight text-white">
                Karigar<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed">
              Connecting rural Indian artisans directly with global buyers. We help preserve ancient handicraft traditions and empower artisan families through direct, fair-trade commerce.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h3 className="text-white font-serif font-semibold text-lg mb-4 pb-2 border-b border-stone-800">
              Discover Craft
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Browse All Crafts
                </Link>
              </li>
              <li>
                <Link to="/artisans" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Discover Our Artisans
                </Link>
              </li>
              <li>
                <Link to="/register?role=artisan" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Sell on Karigar
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white font-serif font-semibold text-lg mb-4 pb-2 border-b border-stone-800">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">Refunds & Returns</a></li>
              <li><a href="#" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all duration-200">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contacts & Socials */}
          <div className="space-y-4">
            <h3 className="text-white font-serif font-semibold text-lg mb-4 pb-2 border-b border-stone-800">
              Contact & Connect
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Craft Hub, Jaipur, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+91 141 234 5678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>support@karigar.in</span>
              </li>
            </ul>
            
            {/* Followers Link Icons */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-700 transition-all duration-200 flex items-center justify-center" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-700 transition-all duration-200 flex items-center justify-center" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.07 1.46 4.194 4.194.044.968.052 1.322.052 3.752c0 2.43-.008 2.784-.052 3.752-.124 2.73-1.46 4.07-4.194 4.194-.968.044-1.322.052-3.752.052-2.43 0-2.784-.008-3.752-.052-2.73-.124-4.07-1.46-4.194-4.194-.044-.968-.052-1.322-.052-3.752 0-2.43.008-2.784.052-3.752.124-2.73 1.46-4.07 4.194-4.194.968-.044 1.322-.052 3.752-.052zm.082 2.2c-2.408 0-2.717.01-3.664.053-2.14.098-3.007.859-3.118 3.117-.043.947-.053 1.254-.053 3.664 0 2.41.01 2.717.053 3.664.11 2.258.974 3.016 3.118 3.117.947.043 1.254.053 3.664.053 2.41 0 2.717-.01 3.664-.053 2.14-.098 3.007-.859 3.118-3.117.043-.947.053-1.254.053-3.664 0-2.41-.01-2.717-.053-3.664-.11-2.258-.974-3.016-3.118-3.117-.947-.043-1.254-.053-3.664-.053zm0 5.8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm4.75-7.675a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-700 transition-all duration-200 flex items-center justify-center" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-amber-400 hover:bg-stone-700 transition-all duration-200 flex items-center justify-center" aria-label="Youtube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.63 22 12 22 12s0 3.37-.42 4.814a2.5 2.5 0 01-1.768 1.768c-1.444.42-4.812.42-4.812.42s-3.368 0-4.812-.42a2.5 2.5 0 01-1.768-1.768C8 15.37 8 12 8 12s0-3.37.42-4.814a2.5 2.5 0 011.768-1.768C11.632 5 15 5 15 5s3.368 0 4.812.418zM13.25 14.5l5.25-2.5-5.25-2.5v5z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        <hr className="border-stone-800 my-8" />

        {/* Copyright & Sign Off */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-xs text-stone-500">
          <p>&copy; {currentYear} Karigar. Empowering Rural Indian Artisans. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> in India
          </p>
        </div>
      </div>
      
      {/* Subtle decorative gold logo in background */}
      <div className="absolute -bottom-10 -left-10 opacity-[0.02] rotate-12">
        <LotusMotif className="w-64 h-64 text-white" />
      </div>
    </footer>
  );
}
