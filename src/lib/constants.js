// Tournaments configuration
export const TOURNAMENTS = {
  brasileirao_2025: {
    id: "brasileirao_2025",
    name: "Brasileirão",
    season: "2025",
  },
  laliga_2526: {
    id: "laliga_2526",
    name: "LaLiga",
    season: "2526",
  },
  premier_league_2526: {
    id: "premier_league_2526",
    name: "Premier League",
    season: "2526",
  },
  bundesliga_2526: {
    id: "bundesliga_2526",
    name: "Bundesliga",
    season: "2526",
  },
  italiano_2526: {
    id: "italiano_2526",
    name: "Italiano",
    season: "2526",
  },
  libertadores_2025: {
    id: "libertadores_2025",
    name: "Libertadores",
    season: "2025",
  },
};

// Team name mapping for API compatibility
// their -> mine
export const TEAM_NAME_MAPPING = {
  Botafogo: "Botafogo (RJ)",
  "Atlético-MG": "Atlético Mineiro",
  Estudiantes: "Estudiantes–LP",
  Colônia: "Köln",
  Bayern: "Bayern Munich",
  Hamburgo: "Hamburger SV",
  Wolverhampton: "Wolverhampton Wanderers",
  Tottenham: "Tottenham Hotspur",
  "West Ham": "West Ham United",
};

// Function to map team names for API compatibility
export const mapTeamName = (teamName) => {
  return TEAM_NAME_MAPPING[teamName] || teamName;
};

// Player name mapping from players API to best-players API
export const PLAYER_NAME_MAPPING = {
  "Chico da Costa": "Francisco da Costa",
};

export const mapPlayerName = (playerName) => {
  return PLAYER_NAME_MAPPING[playerName] || playerName;
};

export const TOURNAMENTS_MAP_NAMES = {
  brasileiro_A: "Brasileirão Série A",
  libertadores: "Libertadores",
  premier_league: "Premier League",
  italiano: "Serie A Italiana",
  bundesliga: "Bundesliga",
  laliga: "La Liga",
  champions: "Champions League",
};

export const STATS_MAP = {
  weighted_fantasy_score: "fantasy_score",
  games_played: "jogos_totais",
  goals: "gols",
  assists: "assistências",
  shots_total: "chutes_totais",
  corner_kicks: "escanteios",
  shots_on_target: "chutes_no_alvo",
  off_target_shot: "finalização_para_fora",
  saved_shot: "finalização_defendida",
  woodwork_shot: "finalização_na_trave",
  tackles: "desarmes",
  interceptions: "interceptações",
  saves: "defesas",
  goals_against: "gols_concedidos",
  team_total_goals_conceded: "gols_concedidos_pelo_time",
  fouls_commited: "faltas_cometidas",
  fouls_drawn: "faltas_recebidas",
  yellow_cards: "cartões_amarelos",
  red_cards: "cartões_vermelhos",
  offsides: "impedimentos",
  penalties_lost: "pênaltis_perdidos",
  penalties_saved: "pênaltis_defendidos",
  wrong_passes: "passes_errados",
};

// Stat categories for player details drawer
export const STAT_CATEGORIES = {
  attacking: {
    name: "Ataque",
    icon: "Target",
    stats: [
      "goals",
      "assists",
      "off_target_shot",
      "saved_shot",
      "woodwork_shot",
    ],
  },
  defensive: {
    name: "Defesa",
    icon: "Shield",
    stats: [
      "tackles",
      "interceptions",
      "saves",
      "goals_against",
      "team_total_goals_conceded",
    ],
  },
  gameplay: {
    name: "Jogo",
    icon: "ChevronsUp",
    stats: [
      "fouls_commited",
      "fouls_drawn",
      "yellow_cards",
      "red_cards",
      "offsides",
      "penalties_lost",
      "penalties_saved",
      "wrong_passes",
    ],
  },
};

// Team color schemes for football field visualization
export const TEAM_COLORS = {
  // Brazilian teams
  Flamengo: {
    gradient: "linear-gradient(135deg, #C52613 0%, #000000 50%, #fff 100%)",
    textColor: "#ffffff",
    borderColor: "#C52613",
  },
  Palmeiras: {
    gradient: "linear-gradient(135deg, #006b3c 0%, #ffffff 50%, #006b3c 100%)",
    textColor: "#000",
    borderColor: "#fff",
  },
  "São Paulo": {
    gradient: "linear-gradient(135deg, #FE0000 0%, #000000 50%, #fff 100%)",
    textColor: "#ffffff",
    borderColor: "#FE0000",
  },
  Corinthians: {
    gradient: "linear-gradient(135deg, #000000 0%, #ffffff 50%, #000000 100%)",
    textColor: "#000",
    borderColor: "#1c1a1aff",
  },
  Santos: {
    gradient: "linear-gradient(135deg, #C69F0F 0%, #ffffff 50%, #000000 100%)",
    textColor: "#000",
    borderColor: "#C69F0F",
  },
  Vasco: {
    gradient: "linear-gradient(135deg, #E2231A 0%, #ffffff 50%, #000000 100%)",
    textColor: "#000",
    borderColor: "#E2231A",
  },
  Botafogo: {
    gradient: "linear-gradient(135deg, #000000 0%, #ffffff 100%)",
    textColor: "#ffffff",
    borderColor: "#000000",
  },
  Fluminense: {
    gradient: "linear-gradient(135deg, #870A28 0%, #00613C 50%, #fff 100%)",
    textColor: "#ffffff",
    borderColor: "#870A28",
  },
  "Atlético-MG": {
    gradient: "linear-gradient(135deg, #FFD503 0%, #000 50%, #fff 100%)",
    textColor: "#ffffff",
    borderColor: "#FFD503",
  },
  Cruzeiro: {
    gradient: "linear-gradient(135deg, #2F529E 0%, #ffffff 100%)",
    textColor: "#000",
    borderColor: "#2F529E",
  },
  Grêmio: {
    gradient: "linear-gradient(135deg, #0D80BF 0%, #000000 50%, #0D80BF 100%)",
    textColor: "#ffffff",
    borderColor: "#0D80BF",
  },
  Internacional: {
    gradient: "linear-gradient(135deg, #E5050F 0%, #ffffff 50%, #E5050F 100%)",
    textColor: "#000",
    borderColor: "#E5050F",
  },
  Ceará: {
    gradient: "linear-gradient(135deg, #fff 0%, #000 100%)",
    textColor: "#ffffff",
    borderColor: "#000",
  },
  Fortaleza: {
    gradient: "linear-gradient(135deg, #006CB5 0%, #ED3237 50%, #fff 100%)",
    textColor: "#ffffff",
    borderColor: "#006CB5",
  },
  Bahia: {
    gradient: "linear-gradient(135deg, #006CB5 0%, #ED3237 50%, #fff 100%)",
    textColor: "#000",
    borderColor: "#006CB5",
  },
  Mirassol: {
    gradient: "linear-gradient(135deg, #F3EC0A 0%, #126F3D 50%, #F3EC0A 100%)",
    textColor: "#ffffff",
    borderColor: "#F3EC0A",
  },
  Juventude: {
    gradient: "linear-gradient(135deg, #009846 0%, #ffffff 50%)",
    textColor: "#000",
    borderColor: "#009846",
  },
  Vitória: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #000000 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  "RB Bragantino": {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  "Red Bull Bragantino": {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  "Sport Recife": {
    gradient: "linear-gradient(135deg, #D40019 0%, #000 50%, #FFD900 100%)",
    textColor: "#ffffff",
    borderColor: "#D40019",
  },

  // International teams
  "Real Madrid": {
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ffffff 100%)",
    textColor: "#000000",
    borderColor: "#ffd700",
  },
  Barcelona: {
    gradient: "linear-gradient(135deg, #a50044 0%, #004d98 50%, #a50044 100%)",
    textColor: "#ffffff",
    borderColor: "#a50044",
  },
  "Manchester United": {
    gradient: "linear-gradient(135deg, #da020e 0%, #ffd700 50%, #da020e 100%)",
    textColor: "#ffffff",
    borderColor: "#da020e",
  },
  "Manchester City": {
    gradient: "linear-gradient(135deg, #6cabdd 0%, #ffffff 50%, #6cabdd 100%)",
    textColor: "#000000",
    borderColor: "#6cabdd",
  },
  Liverpool: {
    gradient: "linear-gradient(135deg, #c8102e 0%, #ffffff 50%, #c8102e 100%)",
    textColor: "#ffffff",
    borderColor: "#c8102e",
  },
  Chelsea: {
    gradient: "linear-gradient(135deg, #034694 0%, #ffffff 50%, #034694 100%)",
    textColor: "#ffffff",
    borderColor: "#034694",
  },
  Arsenal: {
    gradient: "linear-gradient(135deg, #ef0107 0%, #ffffff 50%, #ef0107 100%)",
    textColor: "#ffffff",
    borderColor: "#ef0107",
  },
  Tottenham: {
    gradient: "linear-gradient(135deg, #132257 0%, #ffffff 50%, #132257 100%)",
    textColor: "#ffffff",
    borderColor: "#132257",
  },
  "Bayern Munich": {
    gradient: "linear-gradient(135deg, #dc052d 0%, #ffffff 50%, #dc052d 100%)",
    textColor: "#ffffff",
    borderColor: "#dc052d",
  },
  "Borussia Dortmund": {
    gradient: "linear-gradient(135deg, #fde100 0%, #000000 50%, #fde100 100%)",
    textColor: "#000000",
    borderColor: "#fde100",
  },
  Juventus: {
    gradient: "linear-gradient(135deg, #000000 0%, #ffffff 50%, #000000 100%)",
    textColor: "#ffffff",
    borderColor: "#000000",
  },
  "AC Milan": {
    gradient: "linear-gradient(135deg, #fb090b 0%, #000000 50%, #fb090b 100%)",
    textColor: "#ffffff",
    borderColor: "#fb090b",
  },
  "Inter Milan": {
    gradient: "linear-gradient(135deg, #0068a8 0%, #000000 50%, #0068a8 100%)",
    textColor: "#ffffff",
    borderColor: "#0068a8",
  },
  Napoli: {
    gradient: "linear-gradient(135deg, #0c4da2 0%, #ffffff 50%, #0c4da2 100%)",
    textColor: "#ffffff",
    borderColor: "#0c4da2",
  },
  Roma: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffd700 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Lazio: {
    gradient: "linear-gradient(135deg, #87ceeb 0%, #ffffff 50%, #87ceeb 100%)",
    textColor: "#000000",
    borderColor: "#87ceeb",
  },
  Atalanta: {
    gradient: "linear-gradient(135deg, #000000 0%, #0066cc 50%, #000000 100%)",
    textColor: "#ffffff",
    borderColor: "#000000",
  },
  Fiorentina: {
    gradient: "linear-gradient(135deg, #7b68ee 0%, #ffffff 50%, #7b68ee 100%)",
    textColor: "#ffffff",
    borderColor: "#7b68ee",
  },
  PSG: {
    gradient: "linear-gradient(135deg, #004170 0%, #ed1c24 50%, #004170 100%)",
    textColor: "#ffffff",
    borderColor: "#004170",
  },
  Marseille: {
    gradient: "linear-gradient(135deg, #0066cc 0%, #ffffff 50%, #0066cc 100%)",
    textColor: "#ffffff",
    borderColor: "#0066cc",
  },
  Lyon: {
    gradient: "linear-gradient(135deg, #0066cc 0%, #ffffff 50%, #0066cc 100%)",
    textColor: "#ffffff",
    borderColor: "#0066cc",
  },
  Monaco: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Lille: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Nice: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #000000 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Rennes: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #000000 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Lens: {
    gradient: "linear-gradient(135deg, #ffd700 0%, #ff0000 50%, #ffd700 100%)",
    textColor: "#000000",
    borderColor: "#ffd700",
  },
  Strasbourg: {
    gradient: "linear-gradient(135deg, #0066cc 0%, #ffffff 50%, #0066cc 100%)",
    textColor: "#ffffff",
    borderColor: "#0066cc",
  },
  Montpellier: {
    gradient: "linear-gradient(135deg, #ff6600 0%, #000000 50%, #ff6600 100%)",
    textColor: "#ffffff",
    borderColor: "#ff6600",
  },
  Nantes: {
    gradient: "linear-gradient(135deg, #0066cc 0%, #ffd700 50%, #0066cc 100%)",
    textColor: "#ffffff",
    borderColor: "#0066cc",
  },
  Reims: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Toulouse: {
    gradient: "linear-gradient(135deg, #7b68ee 0%, #ffffff 50%, #7b68ee 100%)",
    textColor: "#ffffff",
    borderColor: "#7b68ee",
  },
  Brest: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  "Le Havre": {
    gradient: "linear-gradient(135deg, #0066cc 0%, #ffffff 50%, #0066cc 100%)",
    textColor: "#ffffff",
    borderColor: "#0066cc",
  },
  Metz: {
    gradient: "linear-gradient(135deg, #ff0000 0%, #ffffff 50%, #ff0000 100%)",
    textColor: "#ffffff",
    borderColor: "#ff0000",
  },
  Clermont: {
    gradient: "linear-gradient(135deg, #ff6600 0%, #000000 50%, #ff6600 100%)",
    textColor: "#ffffff",
    borderColor: "#ff6600",
  },
  Lorient: {
    gradient: "linear-gradient(135deg, #ff6600 0%, #ffffff 50%, #ff6600 100%)",
    textColor: "#ffffff",
    borderColor: "#ff6600",
  },
};

// Function to get team colors with fallback
export const getTeamColors = (teamName) => {
  // Try exact match first
  if (TEAM_COLORS[teamName]) {
    return TEAM_COLORS[teamName];
  }

  // Try to find partial match for common variations
  const normalizedName = teamName.toLowerCase().trim();
  const teamKeys = Object.keys(TEAM_COLORS);

  for (const key of teamKeys) {
    const normalizedKey = key.toLowerCase().trim();
    if (
      normalizedName.includes(normalizedKey) ||
      normalizedKey.includes(normalizedName)
    ) {
      return TEAM_COLORS[key];
    }
  }

  // Default fallback colors
  return {
    gradient: "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%)",
    textColor: "#ffffff",
    borderColor: "#6b7280",
  };
};

// Function to generate unique tournament identifier
export const generateTournamentKey = (tournamentId, matches = []) => {
  if (!matches || matches.length === 0) {
    return tournamentId;
  }

  // Extract team names from matches and create unique identifier
  const teamNames = matches
    .map((match) => [match.firstTeamName, match.secondTeamName])
    .flat()
    .filter(Boolean)
    .join("_");

  return `${tournamentId}_${teamNames}`;
};
