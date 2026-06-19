import { api, Match, parseLocalDate, parseScorers, STADIUMS, sanitizeString } from './api';

export async function getMatches(): Promise<Match[]> {
  const response = await api.get('/games');
  const rawGames = response.data?.games || [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawGames.map((t: any) => {
    const stadium = STADIUMS[String(t.stadium_id)] || {
      name: `Stadium #${t.stadium_id}`,
      city: "Host City",
      country: "North America"
    };

    const isFinished = t.finished === 'TRUE' || t.time_elapsed === 'finished';
    const isLive = t.time_elapsed === 'live' || t.time_elapsed === 'live_delay';
    
    let status: Match['status'] = 'Scheduled';
    if (isLive) {
      status = 'Live';
    } else if (isFinished) {
      status = 'Finished';
    } else if (t.time_elapsed === 'notstarted') {
      status = 'Upcoming';
    } else if (t.time_elapsed === 'delay' || t.time_elapsed === 'delayed') {
      status = 'Delayed';
    }

    const homeScore = t.home_score !== null && t.home_score !== undefined && t.home_score !== 'null' 
      ? parseInt(t.home_score, 10) 
      : null;
    const awayScore = t.away_score !== null && t.away_score !== undefined && t.away_score !== 'null' 
      ? parseInt(t.away_score, 10) 
      : null;

    return {
      id: String(t.id || t._id),
      homeTeamId: String(t.home_team_id),
      awayTeamId: String(t.away_team_id),
      homeScore,
      awayScore,
      homeScorers: parseScorers(t.home_scorers),
      awayScorers: parseScorers(t.away_scorers),
      group: sanitizeString(t.group || ''),
      matchday: parseInt(t.matchday || '0', 10),
      localDate: t.local_date || '',
      date: parseLocalDate(t.local_date),
      stadiumId: String(t.stadium_id),
      stadiumName: stadium.name,
      stadiumCity: stadium.city,
      stadiumCountry: stadium.country,
      finished: isFinished,
      timeElapsed: t.time_elapsed || 'notstarted',
      status,
      type: (t.type || 'group') as Match['type'],
      homeTeamName: sanitizeString(t.home_team_name_en || t.home_team_label || 'TBD'),
      awayTeamName: sanitizeString(t.away_team_name_en || t.away_team_label || 'TBD'),
      homeTeamLabel: sanitizeString(t.home_team_label || ''),
      awayTeamLabel: sanitizeString(t.away_team_label || '')
    };
  });
}
