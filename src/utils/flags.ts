/**
 * Mapping of team names to flagcdn ISO-3166-1 alpha-2 codes (lowercase).
 * Includes special subnational codes for UK nations (England, Scotland, Wales).
 */
const COUNTRY_CODES: Record<string, string> = {
  "algeria": "dz",
  "argentina": "ar",
  "australia": "au",
  "austria": "at",
  "belgium": "be",
  "bolivia": "bo",
  "bosnia and herzegovina": "ba",
  "brazil": "br",
  "cameroon": "cm",
  "canada": "ca",
  "cape verde": "cv",
  "chile": "cl",
  "china": "cn",
  "colombia": "co",
  "costa rica": "cr",
  "croatia": "hr",
  "czech republic": "cz",
  "democratic republic of the congo": "cd",
  "denmark": "dk",
  "ecuador": "ec",
  "egypt": "eg",
  "el salvador": "sv",
  "england": "gb-eng",
  "finland": "fi",
  "france": "fr",
  "germany": "de",
  "ghana": "gh",
  "greece": "gr",
  "honduras": "hn",
  "hungary": "hu",
  "iran": "ir",
  "iraq": "iq",
  "italy": "it",
  "ivory coast": "ci",
  "jamaica": "jm",
  "japan": "jp",
  "jordan": "jo",
  "mali": "ml",
  "mexico": "mx",
  "morocco": "ma",
  "netherlands": "nl",
  "new zealand": "nz",
  "nigeria": "ng",
  "norway": "no",
  "panama": "pa",
  "paraguay": "py",
  "peru": "pe",
  "poland": "pl",
  "portugal": "pt",
  "qatar": "qa",
  "saudi arabia": "sa",
  "scotland": "gb-sct",
  "senegal": "sn",
  "serbia": "rs",
  "south africa": "za",
  "south korea": "kr",
  "spain": "es",
  "sweden": "se",
  "switzerland": "ch",
  "tunisia": "tn",
  "turkey": "tr",
  "ukraine": "ua",
  "united arab emirates": "ae",
  "united states": "us",
  "uruguay": "uy",
  "uzbekistan": "uz",
  "venezuela": "ve",
  "wales": "gb-wls"
};

/**
 * Resolves a team name to its corresponding Flag CDN image URL.
 * Falls back to a default flag in case of missing matches or TBD placeholders.
 */
export function getTeamFlagUrl(teamName: string): string {
  if (!teamName || teamName.trim() === '' || teamName.toUpperCase() === 'TBD') {
    return 'https://flagcdn.com/w80/un.png';
  }

  const normalized = teamName.toLowerCase().trim();
  const code = COUNTRY_CODES[normalized];

  if (code) {
    return `https://flagcdn.com/w80/${code}.png`;
  }

  // General fallback using substring for other countries
  const fallbackCode = normalized.substring(0, 2);
  return `https://flagcdn.com/w80/${fallbackCode}.png`;
}
