'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Bell, CalendarPlus, Download, Clock } from 'lucide-react';
import { Match } from '@/services/api';
import ReminderModal from './ReminderModal';
import { useStore } from '@/store/useStore';
import { getGoogleCalendarUrl, downloadIcsFile } from '@/utils/calendar';
import { getTeamFlagUrl } from '@/utils/flags';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { getReminder } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasReminder = mounted && !!getReminder(match.id);

  // Countdown timer hook
  useEffect(() => {
    if (match.status !== 'Upcoming' && match.status !== 'Scheduled') {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const difference = match.date.getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        // Page should reload or show started state
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match.date, match.status]);



  // Mock flag generator for knockout phases with labels
  const getFlagUrl = (teamId: string, teamName: string) => {
    if (teamId === '0') {
      return ''; // No flag for TBD knockout placeholders
    }
    // Flag CDN uses lowercase ISO2 code. We look it up or fallback to a standard flag CDN.
    // The API provides team flags, so we can pass them. But since match cards have flag URLs,
    // wait - does games API have flag URLs? No, games API only has team names and stadium_id.
    // Ah! Games API does NOT have flags. But we can build flag URLs using flagcdn.com/w80/iso.png
    // Or we can search the team by name or ID in the Teams list to fetch its flag!
    // That is very easy. But wait! Let's generate flagcdn URL from a mapping of common team IDs to country codes,
    // or just fetch all teams and map them! Let's build a small helper for team flag mapping.
  };

  const isLive = match.status === 'Live';
  const isFinished = match.status === 'Finished';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between border border-white/5 relative overflow-hidden">
      {/* Top Bar: Live indicator or Group & Matchday */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 border-b border-white/5 pb-2.5">
        <span className="font-semibold text-brand-blue tracking-wider uppercase">
          {match.type === 'group' ? `Group ${match.group}` : match.group}
        </span>
        <div className="flex items-center gap-1.5 font-medium">
          {isLive ? (
            <span className="flex items-center gap-1 bg-brand-crimson/15 text-brand-crimson font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider live-indicator">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-crimson"></span>
              Live
            </span>
          ) : isFinished ? (
            <span className="bg-white/5 text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              FT
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              Matchday {match.matchday}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Teams & Score */}
      <div className="grid grid-cols-3 items-center gap-3 py-3">
        {/* Home Team */}
        <div className="flex flex-col items-center text-center">
          {match.homeTeamId !== '0' ? (
            <img 
              src={getTeamFlagUrl(match.homeTeamName)}
              alt={match.homeTeamName}
              className="w-10 h-7 object-cover rounded shadow-md border border-white/10 mb-2"
              onError={(e) => {
                // If lookup fails, fallback
                (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
              }}
            />
          ) : (
            <div className="w-10 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <span className="text-[10px] font-bold text-gray-600">TBD</span>
            </div>
          )}
          <span className="text-xs md:text-sm font-bold text-white leading-tight max-w-[90px] truncate">
            {match.homeTeamName}
          </span>
        </div>

        {/* Scoreboard / Time */}
        <div className="flex flex-col items-center justify-center">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2.5">
              <span className={`text-xl md:text-2xl font-black ${isLive ? 'text-brand-blue glow-text' : 'text-white'}`}>
                {match.homeScore}
              </span>
              <span className="text-gray-500 text-xs font-semibold">:</span>
              <span className={`text-xl md:text-2xl font-black ${isLive ? 'text-brand-blue glow-text' : 'text-white'}`}>
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-sm font-bold text-gray-200">
                {match.localDate.split(' ')[1]}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {match.localDate.split(' ')[0].substring(0, 5)}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center text-center">
          {match.awayTeamId !== '0' ? (
            <img 
              src={getTeamFlagUrl(match.awayTeamName)}
              alt={match.awayTeamName}
              className="w-10 h-7 object-cover rounded shadow-md border border-white/10 mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
              }}
            />
          ) : (
            <div className="w-10 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <span className="text-[10px] font-bold text-gray-600">TBD</span>
            </div>
          )}
          <span className="text-xs md:text-sm font-bold text-white leading-tight max-w-[90px] truncate">
            {match.awayTeamName}
          </span>
        </div>
      </div>

      {/* Scorers Section */}
      {(isFinished || isLive) && (match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 py-2 border-t border-white/5 mt-2">
          <div className="pr-2 border-r border-white/5">
            {match.homeScorers.map((s, idx) => (
              <div key={idx} className="truncate text-left font-medium text-slate-300">{s}</div>
            ))}
          </div>
          <div className="pl-2">
            {match.awayScorers.map((s, idx) => (
              <div key={idx} className="truncate text-left font-medium text-slate-300">{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* Countdown Panel */}
      {timeLeft && (
        <div className="rounded-xl bg-white/5 border border-white/[0.03] p-2 mt-3 text-center flex items-center justify-center gap-3">
          <Clock className="h-3.5 w-3.5 text-brand-blue" />
          <div className="flex gap-2 text-[11px] font-mono text-gray-200">
            <div><span className="text-white font-bold">{timeLeft.days}</span>d</div>
            <div><span className="text-white font-bold">{timeLeft.hours}</span>h</div>
            <div><span className="text-white font-bold">{timeLeft.minutes}</span>m</div>
            <div><span className="text-white font-bold">{timeLeft.seconds}</span>s</div>
          </div>
        </div>
      )}

      {/* Stadium Venue Footer */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-4 pt-3 border-t border-white/5">
        <MapPin className="h-3 w-3 text-gray-600 shrink-0" />
        <span className="truncate">{match.stadiumName} • {match.stadiumCity}, {match.stadiumCountry}</span>
      </div>

      {/* Quick Action Drawer */}
      {(match.status === 'Upcoming' || match.status === 'Scheduled') && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
          <button 
            onClick={() => setIsReminderOpen(true)}
            className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border ${
              hasReminder 
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bell className={`h-3 w-3 ${hasReminder ? 'fill-brand-blue' : ''}`} />
            {hasReminder ? 'Reminder Set' : 'Remind'}
          </button>
          
          <div className="flex gap-1">
            <a 
              href={getGoogleCalendarUrl(match)}
              target="_blank"
              rel="noopener noreferrer"
              title="Add to Google Calendar"
              className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
            </a>
            
            <button 
              onClick={() => downloadIcsFile(match)}
              title="Download ICS Event file"
              className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Reminder settings Modal */}
      <ReminderModal 
        match={match}
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
      />
    </div>
  );
}
