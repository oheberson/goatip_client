// Tournaments configuration
export const TOURNAMENTS = {
  brasileirao_2025: {
    id: "brasileirao_2025",
    name: "Brasileirão 2025",
    season: "2025",
  },
  // Add more tournaments here in the future
};

// Team name mapping for API compatibility
export const TEAM_NAME_MAPPING = {
  Botafogo: "Botafogo (RJ)",
  // Add more team mappings as needed
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

// Stat categories for player details drawer
export const STAT_CATEGORIES = {
  attacking: {
    name: "Attacking",
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
    name: "Defensive",
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
    name: "Gameplay",
    icon: "ChevronsUp",
    stats: [
      "fouls_commited",
      "fould_drawn",
      "yellow_cards",
      "red_cards",
      "offsides",
      "penalties_lost",
      "penalties_saved",
      "wrong_passes",
    ],
  },
};
