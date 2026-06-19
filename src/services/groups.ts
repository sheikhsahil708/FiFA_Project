import { api, Group } from './api';
import { getTeams } from './teams';

export async function getGroups(): Promise<Group[]> {
  const [teams, response] = await Promise.all([
    getTeams(),
    api.get('/groups')
  ]);

  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const rawGroups = response.data?.groups || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawGroups.map((g: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupTeams = (g.teams || []).map((gt: any) => {
      const team = teamsMap.get(String(gt.team_id));
      return {
        teamId: String(gt.team_id),
        name: team?.name || `Team #${gt.team_id}`,
        flag: team?.flag || '',
        fifaCode: team?.fifaCode || '',
        played: parseInt(gt.mp || '0', 10),
        wins: parseInt(gt.w || '0', 10),
        draws: parseInt(gt.d || '0', 10),
        losses: parseInt(gt.l || '0', 10),
        goalsFor: parseInt(gt.gf || '0', 10),
        goalsAgainst: parseInt(gt.ga || '0', 10),
        goalDifference: parseInt(gt.gd || '0', 10),
        points: parseInt(gt.pts || '0', 10)
      };
    });

    // Sort teams in standing order (points desc, then goal difference desc, then goals for desc)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupTeams.sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    return {
      id: String(g._id),
      name: g.name || '',
      teams: groupTeams
    };
  });
}
