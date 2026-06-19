import { api, Team } from './api';

export async function getTeams(): Promise<Team[]> {
  const response = await api.get('/teams');
  const rawTeams = response.data?.teams || [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawTeams.map((t: any) => ({
    id: String(t.id || t._id),
    name: t.name_en ? t.name_en.trim() : 'Unknown Team',
    flag: t.flag || '',
    fifaCode: t.fifa_code || '',
    iso2: t.iso2 || '',
    group: t.groups || ''
  }));
}
