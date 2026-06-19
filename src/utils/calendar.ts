import { Match } from '@/services/api';

/**
 * Generates a Google Calendar template link for the given match.
 */
export const getGoogleCalendarUrl = (match: Match): string => {
  const title = encodeURIComponent(`${match.homeTeamName} vs ${match.awayTeamName} - FIFA World Cup 2026`);
  
  // Ensure we have a valid Date object
  const matchDate = typeof match.date === 'string' ? new Date(match.date) : match.date;
  const startUTC = matchDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(matchDate.getTime() + 120 * 60000); // 2 hours
  const endUTC = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const details = encodeURIComponent(`FIFA World Cup 2026 Matchday ${match.matchday}. Group/Stage: ${match.group}. Watch it live!`);
  const location = encodeURIComponent(`${match.stadiumName}, ${match.stadiumCity}, ${match.stadiumCountry}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUTC}/${endUTC}&details=${details}&location=${location}`;
};

/**
 * Formats ICS string safe from special character issues.
 */
const escapeIcsString = (str: string): string => {
  return str.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
};

/**
 * Triggers client-side browser download of the ICS event file for the match.
 */
export const downloadIcsFile = (match: Match): void => {
  if (typeof window === 'undefined') return;

  const matchDate = typeof match.date === 'string' ? new Date(match.date) : match.date;
  const start = matchDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = new Date(matchDate.getTime() + 120 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FIFA World Cup 2026 Tracker//EN',
    'BEGIN:VEVENT',
    `UID:match-${match.id}-fifa2026`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsString(`${match.homeTeamName} vs ${match.awayTeamName} - FIFA World Cup 2026`)}`,
    `DESCRIPTION:${escapeIcsString(`FIFA World Cup 2026 Matchday ${match.matchday} (${match.group})`)}`,
    `LOCATION:${escapeIcsString(match.stadiumName)}\\, ${escapeIcsString(match.stadiumCity)}\\, ${escapeIcsString(match.stadiumCountry)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const safeHome = match.homeTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeAway = match.awayTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  link.download = `match-${match.id}-${safeHome}-vs-${safeAway}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
