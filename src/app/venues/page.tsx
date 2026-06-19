'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, Users, Search, Calendar, Compass, Info, X, 
  ChevronRight, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { getStadiums } from '@/services/stadiums';
import { getMatches } from '@/services/matches';
import { Stadium, Match } from '@/services/api';

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'capacity-desc' | 'capacity-asc' | 'name-asc'>('capacity-desc');
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);

  // Queries
  const { data: stadiums = [], isLoading: isLoadingStadiums } = useQuery<Stadium[]>({
    queryKey: ['stadiums'],
    queryFn: getStadiums,
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  // Helper: Get matches for a specific stadium
  const getStadiumMatches = (stadiumId: string): Match[] => {
    return matches
      .filter(m => m.stadiumId === stadiumId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Filter & Sort logic
  const filteredStadiums = stadiums
    .filter(st => {
      const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            st.fifaName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = selectedCountry === 'All' || 
                             st.country.toLowerCase() === selectedCountry.toLowerCase();
                             
      const matchesRegion = selectedRegion === 'All' || 
                            st.region.toLowerCase() === selectedRegion.toLowerCase();

      return matchesSearch && matchesCountry && matchesRegion;
    })
    .sort((a, b) => {
      if (sortBy === 'capacity-desc') {
        return b.capacity - a.capacity;
      }
      if (sortBy === 'capacity-asc') {
        return a.capacity - b.capacity;
      }
      return a.name.localeCompare(b.name);
    });

  const countries = ['All', 'United States', 'Mexico', 'Canada'];
  const regions = ['All', 'Eastern', 'Central', 'Western'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Host Venues Directory</h2>
        <p className="text-gray-400 text-xs mt-1">Explore all 16 official stadiums across North America for the 2026 FIFA World Cup</p>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 border border-white/5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search stadiums by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-xs text-white placeholder-gray-400 outline-none transition-all focus:border-brand-blue/50"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Country Selector */}
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2 px-4 pr-10 text-xs text-white outline-none cursor-pointer focus:border-brand-blue/50 bg-[#07090e]"
            >
              {countries.map(c => (
                <option key={c} value={c} className="bg-[#0b0e14] text-white">
                  {c === 'All' ? 'All Host Countries' : c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Region Selector */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2 px-4 pr-10 text-xs text-white outline-none cursor-pointer focus:border-brand-blue/50 bg-[#07090e]"
            >
              {regions.map(r => (
                <option key={r} value={r} className="bg-[#0b0e14] text-white">
                  {r === 'All' ? 'All Regions' : `${r} Region`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <Compass className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'capacity-desc' | 'capacity-asc' | 'name-asc')}
              className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2 px-4 pr-10 text-xs text-white outline-none cursor-pointer focus:border-brand-blue/50 bg-[#07090e]"
            >
              <option value="capacity-desc" className="bg-[#0b0e14] text-white">Capacity: Highest First</option>
              <option value="capacity-asc" className="bg-[#0b0e14] text-white">Capacity: Lowest First</option>
              <option value="name-asc" className="bg-[#0b0e14] text-white">Name: Alphabetical</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <ArrowUpDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Stadium Grid */}
      {isLoadingStadiums ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStadiums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStadiums.map(st => {
            const venueMatches = getStadiumMatches(st.id);
            const countryCode = st.country.toLowerCase() === 'united states' ? 'us' : st.country.toLowerCase() === 'canada' ? 'ca' : 'mx';
            
            return (
              <div 
                key={st.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/5 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Card Header: Region & Flag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      st.region === 'Western' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : st.region === 'Central'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {st.region} Region
                    </span>
                    <img 
                      src={`https://flagcdn.com/w80/${countryCode}.png`} 
                      alt={st.country} 
                      className="w-5 h-3.5 object-cover rounded shadow-sm border border-white/10"
                    />
                  </div>

                  {/* Stadium Name & City */}
                  <h3 className="text-sm font-bold text-white leading-tight mb-1">{st.name}</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-blue" />
                    <span>{st.city}, {st.country}</span>
                  </p>

                  {/* Sub-FIFA name */}
                  {st.fifaName !== st.name && (
                    <p className="text-[9px] text-gray-500 italic mt-1 font-medium">Official: {st.fifaName}</p>
                  )}
                </div>

                {/* Stadium Stats */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1 font-medium">
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                    <span>{st.capacity.toLocaleString()} seats</span>
                  </div>
                  
                  <div className="flex items-center gap-1 font-semibold text-brand-blue">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{isLoadingMatches ? '...' : `${venueMatches.length} matches`}</span>
                  </div>
                </div>

                {/* View details overlay click */}
                <button
                  onClick={() => setSelectedStadium(st)}
                  className="w-full mt-4 flex items-center justify-center gap-1 rounded-xl bg-white/5 hover:bg-brand-blue/10 border border-white/5 hover:border-brand-blue/20 py-2 text-xs font-bold text-gray-300 hover:text-brand-blue transition-all cursor-pointer"
                >
                  View Fixtures
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
          <Compass className="h-10 w-10 text-gray-600 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-400">No stadiums match your criteria</p>
        </div>
      )}

      {/* Stadium Fixtures Modal */}
      {selectedStadium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedStadium(null)} />
          
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c101a] p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <button 
              onClick={() => setSelectedStadium(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Stadium Details Header */}
            <div className="border-b border-white/5 pb-4 mb-4 mt-2">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block mb-1">Host Venue</span>
              <h3 className="text-lg font-bold text-white leading-tight">{selectedStadium.name}</h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                <span>{selectedStadium.city}, {selectedStadium.country} • {selectedStadium.region} Region</span>
              </p>
              
              <div className="flex gap-4 mt-3 text-xs text-gray-300">
                <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/[0.02] flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-[9px] text-gray-500 block leading-none">CAPACITY</span>
                    <span className="font-bold">{selectedStadium.capacity.toLocaleString()} seats</span>
                  </div>
                </div>

                <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/[0.02] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-[9px] text-gray-500 block leading-none">TOTAL GAMES</span>
                    <span className="font-bold">{getStadiumMatches(selectedStadium.id).length} Matches</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Listings */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Scheduled Matches</h4>
              {getStadiumMatches(selectedStadium.id).length > 0 ? (
                <div className="space-y-2.5">
                  {getStadiumMatches(selectedStadium.id).map(match => {
                    const isLive = match.status === 'Live';
                    const isFinished = match.status === 'Finished';
                    
                    return (
                      <div 
                        key={match.id}
                        className="rounded-xl border border-white/5 bg-white/5 p-3.5 flex justify-between items-center text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-brand-blue font-bold uppercase tracking-wide">
                            {match.group.startsWith('Group') ? match.group : `Stage: ${match.group}`}
                          </span>
                          <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                            <span>{match.homeTeamName}</span>
                            <span className="text-gray-500 text-[10px]">vs</span>
                            <span>{match.awayTeamName}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {match.localDate}
                          </span>
                        </div>

                        {/* Scores or FT */}
                        <div className="text-right flex flex-col items-end gap-1.5 font-mono">
                          {isFinished || isLive ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 font-bold">
                              <span className={isLive ? 'text-brand-blue' : 'text-white'}>{match.homeScore}</span>
                              <span className="text-gray-600">:</span>
                              <span className={isLive ? 'text-brand-blue' : 'text-white'}>{match.awayScore}</span>
                              {isLive && (
                                <span className="ml-1 bg-brand-crimson text-white text-[8px] font-bold px-1 rounded animate-pulse">LIVE</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 rounded-lg px-2 py-1 font-sans font-bold">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
                  <Info className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No match listings are mapped to this stadium yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VenueCardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-white/10 rounded-full"></div>
        <div className="h-4 w-6 bg-white/10 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-white/10 rounded"></div>
        <div className="h-4 w-1/2 bg-white/10 rounded"></div>
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between">
        <div className="h-4 w-16 bg-white/10 rounded"></div>
        <div className="h-4 w-20 bg-white/10 rounded"></div>
      </div>
      <div className="h-8 w-full bg-white/5 rounded-xl"></div>
    </div>
  );
}
