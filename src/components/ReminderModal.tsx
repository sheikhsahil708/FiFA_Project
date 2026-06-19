'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Bell, BellOff, X, Check, CalendarPlus, Download, Sliders } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Match } from '@/services/api';
import { getGoogleCalendarUrl, downloadIcsFile } from '@/utils/calendar';

interface ReminderModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderModal({ match, isOpen, onClose }: ReminderModalProps) {
  const { addReminder, getReminder, removeReminder } = useStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [isSaved, setIsSaved] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeReminder = getReminder(match.id);

  // Time remaining helper
  const diffMs = match.date ? new Date(match.date).getTime() - Date.now() : 0;
  const diffMins = Math.floor(diffMs / 60000);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    if (activeReminder) {
      const isPreset = [15, 30, 60, 180, 1440].includes(activeReminder.timeBeforeMinutes);
      if (isPreset) {
        setSelectedMinutes(activeReminder.timeBeforeMinutes);
        setIsCustomMode(false);
      } else {
        setSelectedMinutes(0);
        setIsCustomMode(true);
        setCustomMinutes(String(activeReminder.timeBeforeMinutes));
      }
    } else {
      setSelectedMinutes(30);
      setIsCustomMode(false);
      setCustomMinutes('');
    }
    setValidationError(null);
  }, [activeReminder, isOpen]);

  if (!isOpen || !mounted) return null;

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        new Notification("Notifications Enabled!", {
          body: "You will receive alerts for matches you set reminders for.",
          icon: "https://img.icons8.com/color/96/football.png"
        });
      }
    }
  };

  const handleSave = () => {
    let finalMinutes = selectedMinutes;
    if (isCustomMode) {
      const parsed = parseInt(customMinutes, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > diffMins) {
        setValidationError(`Please enter a value between 1 and ${diffMins}`);
        return;
      }
      finalMinutes = parsed;
    }

    addReminder(match.id, finalMinutes);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    removeReminder(match.id);
    onClose();
  };

  const reminderOptions = [
    { label: '15 Mins Before', value: 15 },
    { label: '30 Mins Before', value: 30 },
    { label: '1 Hour Before', value: 60 },
    { label: '3 Hours Before', value: 180 },
    { label: '24 Hours Before', value: 1440 },
  ];

  const isSaveDisabled = isSaved || 
    (isCustomMode && (!!validationError || !customMinutes)) ||
    (diffMins <= 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c101a] p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Set Match Reminder</h3>
            <p className="text-xs text-gray-400">Get alerted before kickoff</p>
          </div>
        </div>

        {/* Match Details */}
        <div className="rounded-xl bg-white/5 p-4 border border-white/[0.03] mb-5">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Fixture</p>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <span>{match.homeTeamName}</span>
            <span className="text-gray-400 text-xs">vs</span>
            <span>{match.awayTeamName}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {match.localDate} ({match.stadiumCity})
          </p>
        </div>

        {/* Notifications Permission Status Indicator */}
        {permission !== 'granted' && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3.5 mb-5 text-xs text-yellow-200/90 flex flex-col gap-2.5">
            <p className="font-medium flex items-center gap-1.5">
              <BellOff className="h-4 w-4 text-yellow-500" />
              Browser Notifications Disabled
            </p>
            <p className="text-[11px] text-yellow-400/80 leading-relaxed">
              Enable notifications to receive real-time alerts directly on your device when a match is about to start.
            </p>
            <button
              onClick={requestPermission}
              className="rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 py-1.5 px-3 font-semibold text-yellow-200 text-center transition-all text-[11px]"
            >
              Request Browser Permission
            </button>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Alert Time</label>
          <div className="grid grid-cols-2 gap-2">
            {reminderOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedMinutes(opt.value);
                  setIsCustomMode(false);
                  setValidationError(null);
                }}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium border text-left transition-all ${
                  !isCustomMode && selectedMinutes === opt.value
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                    : 'border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {!isCustomMode && selectedMinutes === opt.value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setSelectedMinutes(0);
              }}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium border text-left transition-all ${
                isCustomMode
                  ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                  : 'border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1"><Sliders className="h-3 w-3" /> Custom Time</span>
              {isCustomMode && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Custom Input Field */}
          {isCustomMode && (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={diffMins > 0 ? diffMins : 9999}
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val <= 0) {
                      setValidationError("Please enter a valid number of minutes.");
                    } else if (val > diffMins) {
                      setValidationError(`Match kicks off in ${diffMins} minutes. Reminders must be set before kickoff.`);
                    } else {
                      setValidationError(null);
                    }
                  }}
                  placeholder="Minutes before start"
                  className="flex-1 rounded-lg bg-black/40 border border-white/10 py-1.5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-brand-blue/50"
                />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mins Before</span>
              </div>
              {validationError ? (
                <p className="text-[10px] text-brand-crimson font-medium">{validationError}</p>
              ) : (
                <p className="text-[9px] text-gray-500">
                  {diffMins > 0 ? `Max allowance: ${diffMins} minutes before kickoff.` : 'Match is starting now.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add to Calendar Section */}
        <div className="border-t border-white/5 pt-4 mb-5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Direct Calendar Sync
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={getGoogleCalendarUrl(match)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white py-2 px-3 text-xs font-bold text-gray-300 transition-all cursor-pointer"
            >
              <CalendarPlus className="h-3.5 w-3.5 text-brand-blue" />
              <span>Google Calendar</span>
            </a>
            <button
              onClick={() => downloadIcsFile(match)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white py-2 px-3 text-xs font-bold text-gray-300 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-brand-blue" />
              <span>Download .ics</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {activeReminder && (
            <button
              onClick={handleRemove}
              className="flex-1 rounded-xl border border-brand-crimson/20 bg-brand-crimson/5 hover:bg-brand-crimson/10 py-2.5 font-semibold text-brand-crimson text-sm transition-all"
            >
              Remove
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 disabled:bg-brand-blue/20 py-2.5 font-bold text-black text-sm transition-all grow glow-btn cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" /> Saved!
              </>
            ) : (
              'Save Reminder'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
