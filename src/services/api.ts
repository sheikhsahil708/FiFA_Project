import axios from 'axios';

// 16 Official stadiums for FIFA World Cup 2026
export const STADIUMS: Record<string, { name: string; city: string; country: string }> = {
  "1": { name: "Estadio Azteca", city: "Mexico City", country: "Mexico" },
  "2": { name: "Estadio Akron", city: "Guadalajara", country: "Mexico" },
  "3": { name: "Estadio BBVA", city: "Monterrey", country: "Mexico" },
  "4": { name: "BC Place", city: "Vancouver", country: "Canada" },
  "5": { name: "BMO Field", city: "Toronto", country: "Canada" },
  "6": { name: "MetLife Stadium", city: "East Rutherford", country: "USA" },
  "7": { name: "SoFi Stadium", city: "Los Angeles", country: "USA" },
  "8": { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA" },
  "9": { name: "Gillette Stadium", city: "Boston", country: "USA" },
  "10": { name: "Lincoln Financial Field", city: "Philadelphia", country: "USA" },
  "11": { name: "AT&T Stadium", city: "Dallas", country: "USA" },
  "12": { name: "NRG Stadium", city: "Houston", country: "USA" },
  "13": { name: "Hard Rock Stadium", city: "Miami", country: "USA" },
  "14": { name: "Lumen Field", city: "Seattle", country: "USA" },
  "15": { name: "Levi's Stadium", city: "San Francisco", country: "USA" },
  "16": { name: "Arrowhead Stadium", city: "Kansas City", country: "USA" }
};

// Types
export interface Team {
  id: string;
  name: string;
  flag: string;
  fifaCode: string;
  iso2: string;
  group: string;
}

export interface Stadium {
  id: string;
  name: string;
  fifaName: string;
  city: string;
  country: string;
  capacity: number;
  region: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  homeScorers: string[];
  awayScorers: string[];
  group: string;
  matchday: number;
  localDate: string;
  date: Date;
  stadiumId: string;
  stadiumName: string;
  stadiumCity: string;
  stadiumCountry: string;
  finished: boolean;
  timeElapsed: string;
  status: 'Live' | 'Upcoming' | 'Scheduled' | 'Finished' | 'Delayed';
  type: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLabel?: string;
  awayTeamLabel?: string;
}

export interface GroupStandingTeam {
  teamId: string;
  name: string;
  flag: string;
  fifaCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  teams: GroupStandingTeam[];
}

// Helper to parse scorers string safely
export function parseScorers(scorersStr: string | null | undefined): string[] {
  if (!scorersStr || scorersStr === 'null') return [];
  
  let str = scorersStr.trim();
  if (str.startsWith('{') && str.endsWith('}')) {
    str = str.substring(1, str.length - 1);
  }
  
  // Normalize typography quotes
  str = str.replace(/[“”]/g, '"');
  
  const scorers: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      if (current.trim()) {
        scorers.push(current.trim().replace(/^["']|["']$/g, '').trim());
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    scorers.push(current.trim().replace(/^["']|["']$/g, '').trim());
  }
  
  return scorers
    .map(s => s.trim())
    .filter(s => s && s !== 'null')
    .map(s => sanitizeString(s)); // Strip any Farsi from scorers if they leak
}

// Helper to parse date "MM/DD/YYYY HH:mm"
export function parseLocalDate(dateStr: string): Date {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    );
  } catch {
    return new Date();
  }
}

// Filter out Persian characters from text string
export function sanitizeString(val: string): string {
  // Matches Persian/Farsi alphabet range
  const farsiPattern = /[\u0600-\u06FF]/g;
  if (farsiPattern.test(val)) {
    return val.replace(farsiPattern, '').trim();
  }
  return val;
}

// Core Axios instance
export const api = axios.create({
  baseURL: 'https://worldcup26.ir/get',
  timeout: 15000,
});

// Add retry logic/interceptors if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.message || error);
    return Promise.reject(error);
  }
);
