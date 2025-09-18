// API utility functions for making requests to different endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Log API URL in development for debugging
if (process.env.NODE_ENV === "development") {
  console.log("API Base URL:", API_BASE_URL);
}

// Log API URL in production for debugging
if (process.env.NODE_ENV === "production") {
  console.log("Production API Base URL:", API_BASE_URL);
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Specific API functions for different endpoints
export const api = {
  // Teams endpoints
  teams: {
    getAll: () => apiRequest("/teams"),
    getById: (id) => apiRequest(`/teams/${id}`),
    create: (teamData) =>
      apiRequest("/teams", {
        method: "POST",
        body: JSON.stringify(teamData),
      }),
    update: (id, teamData) =>
      apiRequest(`/teams/${id}`, {
        method: "PUT",
        body: JSON.stringify(teamData),
      }),
    delete: (id) =>
      apiRequest(`/teams/${id}`, {
        method: "DELETE",
      }),
  },

  // Matches endpoints
  matches: {
    getAll: () => apiRequest("/matches"),
    getById: (id) => apiRequest(`/matches/${id}`),
    getUpcoming: () => apiRequest("/matches/upcoming"),
    getByDate: (date) => apiRequest(`/matches?date=${date}`),
  },

  // Players endpoints
  players: {
    getAll: () => apiRequest("/players"),
    getById: (id) => apiRequest(`/players/${id}`),
    getByPosition: (position) => apiRequest(`/players?position=${position}`),
    getByTeam: (teamId) => apiRequest(`/players?team=${teamId}`),
    getByTournament: (matchId, roundId) =>
      apiRequest("/players", {
        method: "POST",
        body: JSON.stringify({ match_id: matchId, round_id: roundId }),
      }),
  },

  // Fantasy teams endpoints
  fantasyTeams: {
    getAll: () => apiRequest("/fantasy-teams"),
    getById: (id) => apiRequest(`/fantasy-teams/${id}`),
    create: (teamData) =>
      apiRequest("/fantasy-teams", {
        method: "POST",
        body: JSON.stringify(teamData),
      }),
    update: (id, teamData) =>
      apiRequest(`/fantasy-teams/${id}`, {
        method: "PUT",
        body: JSON.stringify(teamData),
      }),
    delete: (id) =>
      apiRequest(`/fantasy-teams/${id}`, {
        method: "DELETE",
      }),
    optimize: (id) =>
      apiRequest(`/fantasy-teams/${id}/optimize`, {
        method: "POST",
      }),
  },

  // Formations endpoints
  formations: {
    getAll: () => apiRequest("/formations"),
    getById: (id) => apiRequest(`/formations/${id}`),
    getRecommended: (players) =>
      apiRequest("/formations/recommend", {
        method: "POST",
        body: JSON.stringify({ players }),
      }),
  },

  // Analytics endpoints
  analytics: {
    getPlayerStats: (playerId) => apiRequest(`/analytics/players/${playerId}`),
    getTeamStats: (teamId) => apiRequest(`/analytics/teams/${teamId}`),
    getFormationStats: (formationId) =>
      apiRequest(`/analytics/formations/${formationId}`),
    getPredictions: (data) =>
      apiRequest("/analytics/predictions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getBestPlayers: (tournamentId) =>
      apiRequest(`/best-players?tournament_id=${tournamentId}`),
    getBestPlayersByTeams: (teams, tournamentId) =>
      apiRequest(
        `/best-players?teams=${teams.join(",")}&tournament_id=${tournamentId}`
      ),
  },

  // Generic function for custom endpoints
  custom: (endpoint, options = {}) => apiRequest(endpoint, options),
};

// Export the base API request function for custom use cases
export { apiRequest };

export default api;
