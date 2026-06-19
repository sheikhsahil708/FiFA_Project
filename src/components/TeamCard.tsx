'use client';

import React from 'react';
import { Heart, Calendar, ArrowRight } from 'lucide-react';
import { Team, Match } from '@/services/api';
import { useStore } from '@/store/useStore';

interface TeamCardProps {
  team: Team;
  nextMatch?: Match;
  onSelect: () => void;
}

export default function TeamCard({ team, nextMatch, onSelect }: TeamCardProps) {
  const { toggleFavorite, isFavorite } = useStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isFav = mounted && isFavorite(team.id);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Top Bar: Group & Favorite */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2.5 py-0.5 rounded-full">
          Group {team.group}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering details modal
            toggleFavorite(team.id);
          }}
          className="rounded-full bg-white/5 border border-white/10 p-1.5 text-gray-400 hover:text-brand-crimson hover:bg-white/10 transition-all cursor-pointer"
        >
          <Heart className={`h-4 w-4 ${isFav ? 'text-brand-crimson fill-brand-crimson' : ''}`} />
        </button>
      </div>

      {/* Main Info */}
      <div className="flex flex-col items-center text-center cursor-pointer mb-4" onClick={onSelect}>
        <img 
          src={team.flag || 'https://flagcdn.com/w80/un.png'} 
          alt={team.name} 
          className="w-16 h-10 object-cover rounded-lg shadow-md border border-white/10 mb-3 group-hover:scale-105 transition-all duration-300"
        />
        <h3 className="font-bold text-white text-sm md:text-base group-hover:text-brand-blue transition-colors leading-tight">
          {team.name}
        </h3>
        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">
          {team.fifaCode || team.iso2}
        </span>
      </div>

      {/* Next Fixture Quick Preview */}
      {nextMatch ? (
        <div 
          onClick={onSelect}
          className="mt-4 pt-3 border-t border-white/5 text-[11px] text-gray-400 flex flex-col gap-1 cursor-pointer hover:bg-white/[0.02] rounded-lg p-1.5 transition-colors"
        >
          <span className="text-[10px] uppercase font-semibold text-gray-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Next Match
          </span>
          <div className="flex justify-between items-center text-xs font-semibold text-white mt-0.5">
            <span className="truncate max-w-[70px]">
              {nextMatch.homeTeamName === team.name ? nextMatch.awayTeamName : nextMatch.homeTeamName}
            </span>
            <span className="text-[10px] text-gray-500 font-normal">
              {nextMatch.localDate.split(' ')[0].substring(0, 5)}
            </span>
          </div>
        </div>
      ) : (
        <div 
          onClick={onSelect}
          className="mt-4 pt-3 border-t border-white/5 text-center text-[10px] text-gray-500 cursor-pointer flex items-center justify-center gap-1 group-hover:text-brand-blue transition-colors"
        >
          <span>View Team History</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
