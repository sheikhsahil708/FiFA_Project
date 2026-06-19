'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Layers, Trophy, Heart } from 'lucide-react';
import { getGroups } from '@/services/groups';
import { Group } from '@/services/api';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';

export default function GroupsPage() {
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const { favorites } = useStore();

  // Sort groups alphabetically by name (A to L)
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Group Standings</h2>
          <p className="text-gray-400 text-xs mt-1">Fetching tables A-L...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <TableSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Group Standings</h2>
        <p className="text-gray-400 text-xs mt-1">Real-time standings for Groups A to L</p>
      </div>

      {/* Grid of groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedGroups.map((group) => (
          <div 
            key={group.id} 
            className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl flex flex-col"
          >
            {/* Table Title Bar */}
            <div className="bg-white/[0.02] px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-brand-blue" />
                Group {group.name}
              </h3>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                Top 2 Qualify + Best 3rd
              </span>
            </div>

            {/* Table contents */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold bg-white/[0.01]">
                    <th className="py-2.5 pl-4 w-10 text-center">Pos</th>
                    <th className="py-2.5 pl-2">Team</th>
                    <th className="py-2.5 text-center w-10">MP</th>
                    <th className="py-2.5 text-center w-8">W</th>
                    <th className="py-2.5 text-center w-8">D</th>
                    <th className="py-2.5 text-center w-8">L</th>
                    <th className="py-2.5 text-center w-12">GD</th>
                    <th className="py-2.5 pr-4 text-center w-12 text-brand-blue">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, idx) => {
                    const isQualifying = idx < 2; // Top 2 qualify
                    const isBestThird = idx === 2; // 3rd spot buffer
                    const isFav = favorites.includes(team.teamId);

                    return (
                      <tr 
                        key={team.teamId}
                        className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                          isFav ? 'bg-brand-crimson/5 hover:bg-brand-crimson/[0.07]' : ''
                        }`}
                      >
                        {/* Position with qualification color indicators */}
                        <td className="py-3 pl-4 text-center font-bold">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] ${
                            isQualifying 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isBestThird
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-white/5 text-gray-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        
                        {/* Team Info (Clickable) */}
                        <td className="py-3 pl-2 font-bold text-white">
                          <Link 
                            href={`/teams?id=${team.teamId}`}
                            className="flex items-center gap-2 hover:text-brand-blue transition-colors max-w-[130px] sm:max-w-none"
                          >
                            {team.flag ? (
                              <img src={team.flag} alt={team.name} className="w-5 h-3.5 object-cover rounded" />
                            ) : (
                              <div className="w-5 h-3.5 bg-white/5 border border-white/10 rounded"></div>
                            )}
                            <span className="truncate">{team.name}</span>
                            {isFav && (
                              <Heart className="h-3 w-3 text-brand-crimson fill-brand-crimson shrink-0" />
                            )}
                          </Link>
                        </td>

                        {/* Stats */}
                        <td className="py-3 text-center text-gray-300 font-medium">{team.played}</td>
                        <td className="py-3 text-center text-gray-300">{team.wins}</td>
                        <td className="py-3 text-center text-gray-300">{team.draws}</td>
                        <td className="py-3 text-center text-gray-300">{team.losses}</td>
                        
                        {/* Goal difference with sign colors */}
                        <td className={`py-3 text-center font-mono ${
                          team.goalDifference > 0 
                            ? 'text-emerald-400' 
                            : team.goalDifference < 0 
                              ? 'text-brand-crimson' 
                              : 'text-gray-400'
                        }`}>
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>

                        {/* Points highlighted */}
                        <td className="py-3 pr-4 text-center font-black text-brand-blue font-mono">
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
