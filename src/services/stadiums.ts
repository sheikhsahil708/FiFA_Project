import { api, Stadium, sanitizeString } from './api';

/**
 * Fetches all 16 official stadiums for the FIFA World Cup 2026.
 * Strips out Farsi fields and maps them to clean English models.
 */
export async function getStadiums(): Promise<Stadium[]> {
  const response = await api.get('/stadiums');
  const rawStadiums = response.data?.stadiums || [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawStadiums.map((st: any) => {
    // Parse capacity to integer safely
    let capacity = 0;
    if (typeof st.capacity === 'number') {
      capacity = st.capacity;
    } else if (typeof st.capacity === 'string') {
      capacity = parseInt(st.capacity.replace(/,/g, ''), 10) || 0;
    }

    return {
      id: String(st.id || st._id),
      name: sanitizeString(st.name_en || st.fifa_name || 'TBD Stadium'),
      fifaName: sanitizeString(st.fifa_name || st.name_en || 'TBD'),
      city: sanitizeString(st.city_en || 'Host City'),
      country: sanitizeString(st.country_en || 'North America'),
      capacity,
      region: sanitizeString(st.region || 'Unknown')
    };
  });
}
