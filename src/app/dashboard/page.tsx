'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Calendar, Users, Layers, Activity } from 'lucide-react';
import { getTeams } from '@/services/teams';
import { getMatches } from '@/services/matches';
import { getGroups } from '@/services/groups';
import { Match, Team, Group } from '@/services/api';
import MatchCard from '@/components/MatchCard';
import { StatsSkeleton, MatchCardSkeleton } from '@/components/LoadingSkeleton';

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1.0;
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function Dashboard() {
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
    // Refetch matches every 30 seconds for live updates
    refetchInterval: 30000,
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const liveMatches = matches.filter(m => m.status === 'Live');
  const finishedMatchesCount = matches.filter(m => m.status === 'Finished').length;
  const totalMatchesCount = matches.length || 104; // API has 104 total matches
  
  const progressPercent = totalMatchesCount > 0 
    ? Math.round((finishedMatchesCount / totalMatchesCount) * 100) 
    : 0;

  // Next 3 upcoming fixtures
  const upcomingMatches = matches
    .filter(m => m.status === 'Upcoming' || m.status === 'Scheduled')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const isLoading = isLoadingTeams || isLoadingMatches || isLoadingGroups;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tournament Dashboard</h2>
          <p className="text-gray-400 text-xs mt-1">Analyzing World Cup 2026 live stats...</p>
        </div>
        <StatsSkeleton />
        <div className="space-y-4">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl border border-white/5 bg-gradient-to-br from-[#0d172e] via-[#090b11] to-[#040609] p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
            USA • Canada • Mexico 2026
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            FIFA World Cup 2026 Tracker
          </h2>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Follow every goal, card, standing, and knockout bracket in real time. Customize reminders and add match schedules directly to your calendars.
          </p>
        </div>
        <div className="relative z-10 shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
          <Trophy className="h-10 w-10 text-brand-blue glow-text mb-2 animate-bounce" />
          <span className="text-xs text-gray-400 uppercase font-semibold">Live Tracker Mode</span>
        </div>
        
        {/* Glow orb */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-brand-blue/5 blur-3xl -z-0"></div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Teams Counter */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Teams</span>
            <span className="text-2xl font-black text-white font-mono">
              <AnimatedCounter value={teams.length} />
            </span>
          </div>
        </div>

        {/* Matches Counter */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Matches</span>
            <span className="text-2xl font-black text-white font-mono">
              <AnimatedCounter value={matches.length} />
            </span>
          </div>
        </div>

        {/* Groups Counter */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Groups</span>
            <span className="text-2xl font-black text-white font-mono">
              <AnimatedCounter value={groups.length} />
            </span>
          </div>
        </div>

        {/* Live Matches Counter */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className={`rounded-xl p-3 ${liveMatches.length > 0 ? 'bg-brand-crimson/10 text-brand-crimson' : 'bg-white/5 text-gray-400'}`}>
            <Activity className={`h-6 w-6 ${liveMatches.length > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Live Matches</span>
            <span className={`text-2xl font-black font-mono ${liveMatches.length > 0 ? 'text-brand-crimson glow-text' : 'text-white'}`}>
              <AnimatedCounter value={liveMatches.length} />
            </span>
          </div>
        </div>
      </div>

      {/* Tournament Progress Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-400">Tournament Progress</span>
          <span className="font-bold text-brand-blue font-mono">{progressPercent}% Completed</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500">
          <span>{finishedMatchesCount} Matches Played</span>
          <span>{totalMatchesCount - finishedMatchesCount} Remaining</span>
        </div>
      </div>

      {/* Live Matches Panel */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-brand-crimson live-indicator"></span>
            <h3 className="text-lg font-bold text-white tracking-tight">Active Live Matches</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Upcoming Fixtures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-white/5 rounded-2xl border border-white/5">
              <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No upcoming matches available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
