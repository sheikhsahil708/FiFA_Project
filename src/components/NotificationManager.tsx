'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { getMatches } from '@/services/matches';
import { Match } from '@/services/api';

export default function NotificationManager() {
  const { reminders, addNotification, removeReminder } = useStore();
  
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
    refetchInterval: 60000, // Sync matches every minute in background
  });

  const firedNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (reminders.length === 0 || matches.length === 0) return;

    const checkReminders = () => {
      const now = Date.now();
      
      reminders.forEach((reminder) => {
        const match = matches.find(m => m.id === reminder.matchId);
        if (!match) return;

        const kickoffTime = match.date.getTime();
        const diffMs = kickoffTime - now;
        const diffMins = Math.ceil(diffMs / 60000);

        // If match starts within target minutes and hasn't started yet
        if (diffMins > 0 && diffMins <= reminder.timeBeforeMinutes) {
          const firedKey = `${reminder.matchId}-${reminder.timeBeforeMinutes}`;
          
          if (!firedNotifications.current.has(firedKey)) {
            firedNotifications.current.add(firedKey);
            
            const title = `Upcoming Match: ${match.homeTeamName} vs ${match.awayTeamName}`;
            const body = `Match starts in ${diffMins} minutes at ${match.stadiumName} (${match.stadiumCity}).`;

            // Trigger system Web Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(title, { 
                  body,
                  icon: "https://flagcdn.com/w80/un.png"
                });
              } catch (e) {
                console.error('Failed to trigger web notification:', e);
              }
            }
            
            // Log to Zustand store
            addNotification(title, body);

            // Clear reminder since it has triggered
            removeReminder(reminder.matchId);
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [reminders, matches, addNotification, removeReminder]);

  return null;
}
