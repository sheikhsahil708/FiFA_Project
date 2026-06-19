'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Heart, Layers, X, Calendar, MapPin, Trophy, Shield } from 'lucide-react';
import { getTeams } from '@/services/teams';
import { getMatches } from '@/services/matches';
import { Team, Match } from '@/services/api';
import TeamCard from '@/components/TeamCard';
import { TeamCardSkeleton } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';

// Main content component containing search param hooks
function TeamsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { favorites, toggleFavorite, isFavorite } = useStore();

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  // Handle auto-opening team details if ID is in URL query parameters
  useEffect(() => {
    const teamId = searchParams.get('id');
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(team);
      }
    }
  }, [searchParams, teams]);

  // Clean URL when closing modal
  const handleCloseModal = () => {
    setSelectedTeam(null);
    router.replace('/teams', { scroll: false });
  };

  // Find next match for each team
  const getNextMatch = (teamName: string): Match | undefined => {
    const teamFixtures = matches.filter(
      m => (m.homeTeamName === teamName || m.awayTeamName === teamName) && 
           (m.status === 'Upcoming' || m.status === 'Scheduled')
    );
    teamFixtures.sort((a, b) => a.date.getTime() - b.date.getTime());
    return teamFixtures[0];
  };

  // Filter teams based on search, group, and favorites filter
  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.fifaCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || t.group === selectedGroup;
    const matchesFav = !showOnlyFavorites || favorites.includes(t.id);
    
    return matchesSearch && matchesGroup && matchesFav;
  });

  // Get selected team matches for detail display
  const selectedTeamMatches = selectedTeam
    ? matches.filter(m => m.homeTeamName === selectedTeam.name || m.awayTeamName === selectedTeam.name)
             .sort((a, b) => a.date.getTime() - b.date.getTime())
    : [];

  const groupsList = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Teams Directory</h2>
          <p className="text-gray-400 text-xs mt-1">Explore all 48 qualified national squads</p>
        </div>

        {/* Favorite toggle filter */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`rounded-full py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 border transition-all ${
            showOnlyFavorites 
              ? 'bg-brand-crimson/10 border-brand-crimson text-brand-crimson'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${showOnlyFavorites ? 'fill-brand-crimson' : ''}`} />
          {showOnlyFavorites ? 'Showing Favorites' : 'Filter Favorites'}
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search team by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none transition-all focus:border-brand-blue/50"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Group Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2.5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-brand-blue/50 cursor-pointer"
          >
            {groupsList.map(grp => (
              <option key={grp} value={grp} className="bg-[#0b0e14] text-white">
                {grp === 'All' ? 'Filter by Group: All Groups' : `Group ${grp}`}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {isLoadingTeams ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredTeams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              nextMatch={getNextMatch(team.name)}
              onSelect={() => setSelectedTeam(team)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
          <Shield className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No teams found matching search criteria</p>
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c101a] p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <button 
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Team details hero */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-5 mb-5 mt-2">
              <img 
                src={selectedTeam.flag || 'https://flagcdn.com/w80/un.png'} 
                alt={selectedTeam.name} 
                className="w-16 h-11 object-cover rounded shadow-md border border-white/10"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                  {selectedTeam.name}
                  <button 
                    onClick={() => toggleFavorite(selectedTeam.id)}
                    className="text-gray-400 hover:text-brand-crimson transition-all"
                  >
                    <Heart className={`h-4.5 w-4.5 ${isFavorite(selectedTeam.id) ? 'text-brand-crimson fill-brand-crimson' : ''}`} />
                  </button>
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-brand-blue tracking-wide">
                    {selectedTeam.fifaCode || selectedTeam.iso2}
                  </span>
                  <span>•</span>
                  <span>Group {selectedTeam.group}</span>
                </p>
              </div>
            </div>

            {/* Matches list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
                <Trophy className="h-3.5 w-3.5 text-brand-blue" />
                Tournament Fixtures ({selectedTeamMatches.length})
              </h4>
              
              {selectedTeamMatches.length > 0 ? (
                <div className="space-y-3">
                  {selectedTeamMatches.map(match => {
                    const isOpponentHome = match.homeTeamName !== selectedTeam.name;
                    const opponent = isOpponentHome ? match.homeTeamName : match.awayTeamName;
                    
                    const isLive = match.status === 'Live';
                    const isFinished = match.status === 'Finished';

                    return (
                      <div 
                        key={match.id}
                        className="rounded-xl border border-white/5 bg-white/5 p-3 flex justify-between items-center text-xs"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide block">
                            {match.group === 'R32' || match.group === 'R16' || match.group === 'QF' || match.group === 'SF' || match.group === 'FINAL' 
                              ? match.group 
                              : `Group Stage • Matchday ${match.matchday}`}
                          </span>
                          <span className="font-bold text-white">
                            {isOpponentHome ? 'vs ' : '@ '}{opponent}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5" /> {match.stadiumCity}
                          </span>
                        </div>

                        {/* Scores or date */}
                        <div className="text-right flex flex-col items-end gap-1 font-mono">
                          {isFinished || isLive ? (
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className={isLive ? 'text-brand-blue' : 'text-white'}>
                                {isOpponentHome ? match.awayScore : match.homeScore}
                              </span>
                              <span className="text-gray-500">:</span>
                              <span className={isLive ? 'text-brand-blue' : 'text-white'}>
                                {isOpponentHome ? match.homeScore : match.awayScore}
                              </span>
                              {isLive && (
                                <span className="bg-brand-crimson text-white text-[8px] font-bold uppercase rounded px-1 animate-pulse">Live</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-end text-[10px] text-gray-400 font-sans">
                              <span className="font-semibold text-gray-200">{match.localDate.split(' ')[0]}</span>
                              <span className="text-gray-500 text-[9px] mt-0.5">{match.localDate.split(' ')[1]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 italic">No matches scheduled for this team</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <TeamCardSkeleton key={i} />
        ))}
      </div>
    }>
      <TeamsContent />
    </Suspense>
  );
}
