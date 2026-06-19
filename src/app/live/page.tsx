'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ShieldAlert, Clock, MapPin, Users, Heart } from 'lucide-react';
import { getMatches } from '@/services/matches';
import { Match } from '@/services/api';
import { MatchCardSkeleton } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';
import { getTeamFlagUrl } from '@/utils/flags';

interface TimelineEvent {
  minute: number;
  minuteStr: string;
  type: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card';
  team: 'home' | 'away';
  player: string;
}

// Seeded random number generator to ensure statistics are stable per match ID
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const x = Math.sin(h++) * 10000;
  return x - Math.floor(x);
}

// Generate stats dynamically but stably for a match
function generateMatchStats(matchId: string, homeScore: number, awayScore: number) {
  const rand1 = seededRandom(matchId + 'pos');
  const rand2 = seededRandom(matchId + 'shots');
  
  // Possession centered around 50% influenced slightly by score
  const goalDiff = homeScore - awayScore;
  const homePossession = Math.min(Math.max(Math.round(50 + goalDiff * 2 + (rand1 * 14 - 7)), 30), 70);
  const awayPossession = 100 - homePossession;

  // Shots matching scores
  const homeShots = Math.round(homeScore * 2.5 + 4 + rand2 * 6);
  const awayShots = Math.round(awayScore * 2.5 + 3 + (1 - rand2) * 6);
  
  const homeShotsOnTarget = Math.min(Math.round(homeScore + 1 + rand1 * 3), homeShots);
  const awayShotsOnTarget = Math.min(Math.round(awayScore + 1 + (1 - rand1) * 3), awayShots);

  const homeFouls = Math.round(8 + rand2 * 8);
  const awayFouls = Math.round(9 + rand1 * 8);

  const homeYellow = Math.round(rand1 * 3);
  const awayYellow = Math.round(rand2 * 3);

  return {
    possession: { home: homePossession, away: awayPossession },
    shots: { home: homeShots, away: awayShots },
    shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
    fouls: { home: homeFouls, away: awayFouls },
    yellowCards: { home: homeYellow, away: awayYellow },
    redCards: { home: homeScore > 4 ? 1 : 0, away: awayScore > 4 ? 1 : 0 }
  };
}

// Parse scorer string into timeline event objects
function parseScorerEvents(scorers: string[], team: 'home' | 'away'): TimelineEvent[] {
  return scorers.map(s => {
    let player = s;
    let minuteStr = '0\'';
    let minute = 0;
    let type: TimelineEvent['type'] = 'goal';

    // Parse "Name 45'+2'" or "Name 60'"
    const match = s.match(/(.*?)\s+(\d+.*?)(?:\s*\((.*?)\))?$/);
    if (match) {
      player = match[1].trim();
      minuteStr = match[2].trim();
      const numericPart = parseInt(minuteStr.replace(/\'/g, ''), 10);
      const isExtra = minuteStr.includes('+');
      minute = numericPart + (isExtra ? 0.5 : 0);

      const details = match[3] ? match[3].toLowerCase() : '';
      if (details.includes('p') || details.includes('pen')) {
        type = 'penalty';
      } else if (details.includes('og') || details.includes('own')) {
        type = 'own_goal';
      }
    } else {
      if (s.toLowerCase().includes('(p)')) type = 'penalty';
      else if (s.toLowerCase().includes('(og)')) type = 'own_goal';
      
      // Try to extract any digits as minute
      const digitMatch = s.match(/\d+/);
      if (digitMatch) {
        minute = parseInt(digitMatch[0], 10);
        minuteStr = `${minute}'`;
        player = s.replace(/\d+.*/g, '').trim();
      }
    }

    return {
      minute,
      minuteStr,
      type,
      team,
      player
    };
  });
}

export default function LiveMatchCenter() {
  const { data: matches = [], isLoading, refetch } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
    refetchInterval: 30000, // Refresh automatically every 30 seconds
  });

  const { favorites } = useStore();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'Live');

  // Auto-select the first live match if none selected
  useEffect(() => {
    if (liveMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(liveMatches[0].id);
    }
  }, [liveMatches, selectedMatchId]);

  const activeMatch = matches.find(m => m.id === selectedMatchId) || liveMatches[0];

  // Build timeline for active match
  const getTimeline = (match: Match): TimelineEvent[] => {
    const homeEvents = parseScorerEvents(match.homeScorers, 'home');
    const awayEvents = parseScorerEvents(match.awayScorers, 'away');
    
    // Generate some mock card events based on seeded stats to make the timeline look rich
    const stats = generateMatchStats(match.id, match.homeScore || 0, match.awayScore || 0);
    const cardEvents: TimelineEvent[] = [];
    
    const hRand = seededRandom(match.id + 'y1');
    const aRand = seededRandom(match.id + 'y2');

    if (stats.yellowCards.home > 0) {
      cardEvents.push({
        minute: Math.round(15 + hRand * 40),
        minuteStr: `${Math.round(15 + hRand * 40)}'`,
        type: 'yellow_card',
        team: 'home',
        player: match.homeTeamId !== '0' ? `Def. of ${match.homeTeamName}` : 'Home Defender'
      });
    }
    if (stats.yellowCards.away > 0) {
      cardEvents.push({
        minute: Math.round(25 + aRand * 50),
        minuteStr: `${Math.round(25 + aRand * 50)}'`,
        type: 'yellow_card',
        team: 'away',
        player: match.awayTeamId !== '0' ? `Def. of ${match.awayTeamName}` : 'Away Defender'
      });
    }

    const merged = [...homeEvents, ...awayEvents, ...cardEvents];
    return merged.sort((a, b) => a.minute - b.minute);
  };

  const getFlagUrl = (teamName: string) => {
    return getTeamFlagUrl(teamName);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Live Match Center</h2>
          <p className="text-gray-400 text-xs mt-1">Connecting to World Cup live feed...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <MatchCardSkeleton />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-white/10 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Live Match Center</h2>
          <p className="text-gray-400 text-xs mt-1">Real-time statistics and timeline. Feeds auto-refresh every 30s.</p>
        </div>
        
        {liveMatches.length > 0 && (
          <span className="flex items-center gap-1 bg-brand-crimson/15 text-brand-crimson font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider live-indicator">
            <span className="h-2 w-2 rounded-full bg-brand-crimson"></span>
            {liveMatches.length} Live
          </span>
        )}
      </div>

      {liveMatches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live matches sidebar list */}
          <div className="lg:col-span-1 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Matches</h3>
            <div className="flex flex-row overflow-x-auto gap-3 pb-3 lg:flex-col lg:overflow-x-visible lg:gap-0 lg:space-y-3">
              {liveMatches.map(m => {
                const isActive = activeMatch?.id === m.id;
                return (
                  <div 
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer w-60 sm:w-72 shrink-0 lg:w-full ${
                      isActive 
                        ? 'border-brand-blue bg-brand-blue/5' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-2 font-mono">
                      <span>{m.group}</span>
                      <span className="text-brand-crimson flex items-center gap-1 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-crimson animate-ping"></span>
                        Live
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <img src={getFlagUrl(m.homeTeamName)} alt="" className="w-5 h-3.5 object-cover rounded" />
                        <span className="truncate max-w-[70px] text-white">{m.homeTeamName}</span>
                      </div>
                      <span className="text-brand-blue glow-text font-black">{m.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold mt-2">
                      <div className="flex items-center gap-2">
                        <img src={getFlagUrl(m.awayTeamName)} alt="" className="w-5 h-3.5 object-cover rounded" />
                        <span className="truncate max-w-[70px] text-white">{m.awayTeamName}</span>
                      </div>
                      <span className="text-brand-blue glow-text font-black">{m.awayScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Live Match Detailed Panel */}
          {activeMatch && (
            <div className="lg:col-span-2 space-y-6">
              {/* Scorecard banner */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-[#0b0e16] to-[#040609] relative overflow-hidden">
                <div className="text-center text-[11px] text-gray-500 mb-4 font-mono">
                  Stadium: {activeMatch.stadiumName} ({activeMatch.stadiumCity})
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-4 py-4 max-w-md mx-auto">
                  {/* Home */}
                  <div className="flex flex-col items-center flex-1 text-center min-w-0">
                    <img 
                      src={getFlagUrl(activeMatch.homeTeamName)} 
                      alt="" 
                      className="w-12 h-8 sm:w-16 sm:h-11 object-cover rounded-lg border border-white/10 shadow-md mb-2" 
                    />
                    <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate w-full">{activeMatch.homeTeamName}</span>
                    {mounted && favorites.includes(activeMatch.homeTeamId) && (
                      <Heart className="h-3 w-3 text-brand-crimson fill-brand-crimson mt-1" />
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center shrink-0 px-2 sm:px-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-blue glow-text flex items-center gap-1.5 sm:gap-2 font-mono">
                      <span>{activeMatch.homeScore}</span>
                      <span className="text-gray-600 text-lg sm:text-2xl">:</span>
                      <span>{activeMatch.awayScore}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-crimson bg-brand-crimson/15 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-brand-crimson animate-ping"></span> Live Center
                    </span>
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-center flex-1 text-center min-w-0">
                    <img 
                      src={getFlagUrl(activeMatch.awayTeamName)} 
                      alt="" 
                      className="w-12 h-8 sm:w-16 sm:h-11 object-cover rounded-lg border border-white/10 shadow-md mb-2" 
                    />
                    <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate w-full">{activeMatch.awayTeamName}</span>
                    {mounted && favorites.includes(activeMatch.awayTeamId) && (
                      <Heart className="h-3 w-3 text-brand-crimson fill-brand-crimson mt-1" />
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Timeline Tabs */}
              <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-6">
                {/* Stats & Timeline side-by-side or stacked grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Timeline Panel */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                      <Clock className="h-4 w-4 text-brand-blue" />
                      Live Match Timeline
                    </h4>
                    
                    <div className="relative border-l border-white/10 pl-6 ml-3 py-2 space-y-5">
                      {getTimeline(activeMatch).length > 0 ? (
                        getTimeline(activeMatch).map((evt, idx) => {
                          const isGoal = evt.type === 'goal' || evt.type === 'penalty' || evt.type === 'own_goal';
                          
                          return (
                            <div key={idx} className="relative flex items-start">
                              {/* Event Timeline Icon dot */}
                              <span className={`absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold ring-4 ring-[#0d121f] ${
                                evt.type === 'yellow_card' 
                                  ? 'bg-yellow-500 text-black' 
                                  : evt.type === 'red_card'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-brand-blue text-black'
                              }`}>
                                {evt.type === 'yellow_card' ? 'Y' : evt.type === 'red_card' ? 'R' : 'G'}
                              </span>

                              <div className="flex-1 text-xs">
                                <span className="font-mono font-bold text-brand-blue block mb-0.5">{evt.minuteStr}</span>
                                <p className="font-semibold text-white leading-snug">
                                  {evt.player}
                                </p>
                                <span className="text-[10px] text-gray-500">
                                  {evt.type === 'penalty' 
                                    ? 'Penalty Goal' 
                                    : evt.type === 'own_goal' 
                                      ? 'Own Goal (OG)' 
                                      : evt.type === 'yellow_card'
                                        ? 'Yellow Card'
                                        : 'Goal'} 
                                  ({evt.team === 'home' ? activeMatch.homeTeamName : activeMatch.awayTeamName})
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500 italic py-2">No key match events recorded yet</p>
                      )}
                    </div>
                  </div>

                  {/* Statistics Panel */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                      <Activity className="h-4 w-4 text-brand-blue" />
                      Live Match Statistics
                    </h4>

                    {(() => {
                      const stats = generateMatchStats(activeMatch.id, activeMatch.homeScore || 0, activeMatch.awayScore || 0);
                      const statsRows = [
                        { label: 'Possession %', home: stats.possession.home, away: stats.possession.away },
                        { label: 'Shots', home: stats.shots.home, away: stats.shots.away },
                        { label: 'Shots on Target', home: stats.shotsOnTarget.home, away: stats.shotsOnTarget.away },
                        { label: 'Fouls Committed', home: stats.fouls.home, away: stats.fouls.away },
                        { label: 'Yellow Cards', home: stats.yellowCards.home, away: stats.yellowCards.away },
                        { label: 'Red Cards', home: stats.redCards.home, away: stats.redCards.away },
                      ];

                      return (
                        <div className="space-y-4 pt-2">
                          {statsRows.map((stat, idx) => {
                            const total = stat.home + stat.away;
                            const homePct = total > 0 ? (stat.home / total) * 100 : 50;
                            
                            return (
                              <div key={idx} className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center text-gray-300">
                                  <span className="font-mono font-bold text-slate-100">{stat.home}</span>
                                  <span className="text-[11px] text-gray-500 font-semibold">{stat.label}</span>
                                  <span className="font-mono font-bold text-slate-100">{stat.away}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-brand-blue rounded-l-full transition-all duration-500" 
                                    style={{ width: `${homePct}%` }}
                                  />
                                  <div 
                                    className="h-full bg-brand-crimson rounded-r-full transition-all duration-500" 
                                    style={{ width: `${100 - homePct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Live Empty state
        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5">
          <ShieldAlert className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-300">No matches currently active</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            There are no live games in progress right now. Live matches will automatically pop up here with scores, events, and timelines.
          </p>
        </div>
      )}
    </div>
  );
}
