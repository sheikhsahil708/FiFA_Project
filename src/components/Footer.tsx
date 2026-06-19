import React from 'react';
import { Trophy, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#07090e]/80 py-8 px-4 md:px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand-blue" />
          <span className="font-semibold text-gray-300">FIFA World Cup 2026 Live Tracker</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span>Created for football fans with</span>
          <Heart className="h-3.5 w-3.5 text-brand-crimson fill-brand-crimson" />
          <span>across USA, Canada, & Mexico</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-brand-blue transition-colors flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> English Only
          </a>
          <span>&copy; {new Date().getFullYear()} World Cup Tracker</span>
        </div>
      </div>
    </footer>
  );
}
