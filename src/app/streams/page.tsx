'use client';

import React from 'react';
import { Globe, Smartphone, Download, ExternalLink } from 'lucide-react';

export default function StreamsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Free Stream Sources</h2>
        <p className="text-gray-400 text-xs mt-1">Watch the FIFA World Cup 2026 games live using these community-recommended free streaming services</p>
      </div>

      {/* Main Grid: Web vs Apps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Websites Card */}
        <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
            <div className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Free Streaming Websites</h4>
              <p className="text-xs text-gray-500">Access directly from any web browser</p>
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href="https://www.yallashots.top/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <span>YallahShoot Live Stream</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://www.epicsports.in/?m=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <span>Epic Sports Cricket & Soccer</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://www.camel1.to/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <span>Camel TV Live</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://streambroadcast.net/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <span>StreamEast Broadcast</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://www.bintv.net/?m=0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <span>Bintv Live Stream</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Apps Card */}
        <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
            <div className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Streaming Applications</h4>
              <p className="text-xs text-gray-500">Free Android & Smart TV apps</p>
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href="https://cricfylive.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                <span>Cricfy Live App</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://playfy.com.co/download-playfy-tv/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                <span>Playfy TV APK</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a 
              href="https://sportzfys.io/#dl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3.5 border border-white/[0.03] hover:border-brand-blue/20 text-xs font-semibold text-gray-200 hover:text-brand-blue transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                <span>Sportzfy APK</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[10px] text-gray-500 leading-relaxed">
        <strong>Disclaimer:</strong> The links and downloads listed above are external third-party resources. This application does not host, control, or take responsibility for any content provided on these sites. Use ad-blockers and standard internet safety measures when streaming.
      </div>
    </div>
  );
}
