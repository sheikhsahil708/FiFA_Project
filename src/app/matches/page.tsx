'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getMatches } from '@/services/matches';
import { Match } from '@/services/api';
import MatchCard from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/LoadingSkeleton';

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: matches = [], isLoading, refetch, isFetching } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  // Filter logic
  const filteredMatches = matches.filter(match => {
    // Search filter
    const matchesSearch = 
      match.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.stadiumCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.stadiumName.toLowerCase().includes(searchQuery.toLowerCase());

    // Stage filter
    let matchesStage = true;
    if (selectedStage !== 'All') {
      if (selectedStage === 'Group Stage') {
        matchesStage = match.type === 'group';
      } else if (selectedStage === 'Round of 32') {
        matchesStage = match.type === 'r32';
      } else if (selectedStage === 'Round of 16') {
        matchesStage = match.type === 'r16';
      } else if (selectedStage === 'Quarter Finals') {
        matchesStage = match.type === 'qf';
      } else if (selectedStage === 'Semi Finals') {
        matchesStage = match.type === 'sf';
      } else if (selectedStage === 'Final & 3rd') {
        matchesStage = match.type === 'final' || match.type === 'third';
      }
    }

    // Status filter
    let matchesStatus = true;
    if (selectedStatus !== 'All') {
      matchesStatus = match.status === selectedStatus;
    }

    return matchesSearch && matchesStage && matchesStatus;
  });

  // Sort matches by date (Finished matches: descending, Scheduled/Upcoming: ascending)
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (a.finished && b.finished) {
      // Both finished: show newest first
      return b.date.getTime() - a.date.getTime();
    }
    if (!a.finished && !b.finished) {
      // Both scheduled: show closest kickoff first
      return a.date.getTime() - b.date.getTime();
    }
    // Finished matches come after scheduled matches or vice versa? 
    // Let's sort simply by chronological order
    return a.date.getTime() - b.date.getTime();
  });

  // Pagination calculations
  const totalItems = sortedMatches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMatches = sortedMatches.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stages = ['All', 'Group Stage', 'Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final & 3rd'];
  const statuses = ['All', 'Live', 'Upcoming', 'Scheduled', 'Finished', 'Delayed'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Match Center</h2>
          <p className="text-gray-400 text-xs mt-1">Schedules, live scores, and tournament archives</p>
        </div>

        {/* Manual Refresh */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-blue' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh Fixtures'}
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by team, city or stadium..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to page 1 on search
            }}
            className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none transition-all focus:border-brand-blue/50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
        </div>

        {/* Stage Filter */}
        <div className="relative">
          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2.5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-brand-blue/50 cursor-pointer"
          >
            {stages.map(stg => (
              <option key={stg} value={stg} className="bg-[#0b0e14] text-white">
                {stg === 'All' ? 'Filter by Stage: All Stages' : stg}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <Filter className="h-4 w-4" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 py-2.5 px-4 pr-10 text-sm text-white outline-none transition-all focus:border-brand-blue/50 cursor-pointer"
          >
            {statuses.map(stat => (
              <option key={stat} value={stat} className="bg-[#0b0e14] text-white">
                {stat === 'All' ? 'Filter by Status: All Statuses' : `Status: ${stat}`}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Matches Grid / Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : paginatedMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
          <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No matches found matching filter criteria</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
          <span className="text-xs text-gray-500">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} fixtures
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 p-2 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-300 font-bold font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 p-2 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
