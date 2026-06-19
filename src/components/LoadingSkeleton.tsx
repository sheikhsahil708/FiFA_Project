import React from 'react';

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d121f]/50 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
        <div className="h-6 w-12 bg-white/10 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-white/10 rounded-lg"></div>
        <div className="h-4 w-1/2 bg-white/10 rounded-lg"></div>
      </div>
      <div className="h-8 w-full bg-white/10 rounded-xl mt-4"></div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d121f]/50 p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="h-4 w-20 bg-white/10 rounded"></div>
        <div className="h-4 w-28 bg-white/10 rounded"></div>
      </div>
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-8 h-5 bg-white/10 rounded"></div>
          <div className="h-4 w-16 bg-white/10 rounded"></div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-12 bg-white/10 rounded"></div>
          <div className="h-3 w-8 bg-white/10 rounded"></div>
        </div>
        <div className="flex items-center gap-3 justify-end w-1/3">
          <div className="h-4 w-16 bg-white/10 rounded"></div>
          <div className="w-8 h-5 bg-white/10 rounded"></div>
        </div>
      </div>
      <div className="h-1 bg-white/5 rounded-full w-full"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-3.5 w-32 bg-white/10 rounded"></div>
        <div className="h-6 w-20 bg-white/10 rounded-full"></div>
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d121f]/50 p-5 text-center space-y-4 animate-pulse">
      <div className="w-16 h-10 bg-white/10 rounded-lg mx-auto"></div>
      <div className="space-y-2">
        <div className="h-5 w-24 bg-white/10 rounded mx-auto"></div>
        <div className="h-3 w-16 bg-white/10 rounded mx-auto"></div>
      </div>
      <div className="h-8 w-full bg-white/10 rounded-xl"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d121f]/50 p-4 space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="h-5 w-24 bg-white/10 rounded"></div>
        <div className="h-4 w-16 bg-white/10 rounded"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-white/10 rounded"></div>
              <div className="w-6 h-4 bg-white/10 rounded"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-6 bg-white/10 rounded"></div>
              <div className="h-4 w-6 bg-white/10 rounded"></div>
              <div className="h-4 w-6 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-[#0d121f]/50 p-5 space-y-2">
          <div className="h-4 w-16 bg-white/10 rounded"></div>
          <div className="h-8 w-12 bg-white/10 rounded"></div>
        </div>
      ))}
    </div>
  );
}
