// API configuration for Goatip
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Import mock data utilities
import { mockApi, shouldUseMockData } from "./mock-data-utils";

// API client with error handling
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// API endpoints for fantasy soccer data
export const api = {
  // Players
  players: {
    getAll: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.players?.getAll?.() || apiClient.get("/players")
        : apiClient.get("/players"),
    getByTournament: (matchId, roundId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.players?.getAll?.() ||
          apiClient.post("/players", { match_id: matchId, round_id: roundId })
        : apiClient.post("/players", { match_id: matchId, round_id: roundId }),
  },

  // Teams
  teams: {
    getAll: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.teams?.getAll?.() || apiClient.get("/teams")
        : apiClient.get("/teams"),
    getById: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.teams?.getById?.(id) || apiClient.get(`/teams/${id}`)
        : apiClient.get(`/teams/${id}`),
    getFixtures: (teamId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.teams?.getFixtures?.(teamId) ||
          apiClient.get(`/teams/${teamId}/fixtures`)
        : apiClient.get(`/teams/${teamId}/fixtures`),
  },

  // Fantasy Teams
  fantasyTeams: {
    getAll: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.getAll?.() || apiClient.get("/fantasy-teams")
        : apiClient.get("/fantasy-teams"),
    getById: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.getById?.(id) ||
          apiClient.get(`/fantasy-teams/${id}`)
        : apiClient.get(`/fantasy-teams/${id}`),
    create: (teamData, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.create?.(teamData) ||
          apiClient.post("/fantasy-teams", teamData)
        : apiClient.post("/fantasy-teams", teamData),
    update: (id, teamData, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.update?.(id, teamData) ||
          apiClient.put(`/fantasy-teams/${id}`, teamData)
        : apiClient.put(`/fantasy-teams/${id}`, teamData),
    delete: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.delete?.(id) ||
          apiClient.delete(`/fantasy-teams/${id}`)
        : apiClient.delete(`/fantasy-teams/${id}`),
    optimize: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.fantasyTeams?.optimize?.(id) ||
          apiClient.post(`/fantasy-teams/${id}/optimize`)
        : apiClient.post(`/fantasy-teams/${id}/optimize`),
  },

  // Formations
  formations: {
    getAll: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.formations?.getAll?.() || apiClient.get("/formations")
        : apiClient.get("/formations"),
    getById: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.formations?.getById?.(id) ||
          apiClient.get(`/formations/${id}`)
        : apiClient.get(`/formations/${id}`),
    getRecommended: (players, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.formations?.getRecommended?.(players) ||
          apiClient.post("/formations/recommend", { players })
        : apiClient.post("/formations/recommend", { players }),
  },

  // Matches
  matches: {
    getAll: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.matches.getAll()
        : apiClient.get("/matches"),
    getById: (id, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.matches.getById(id)
        : apiClient.get(`/matches/${id}`),
    getUpcoming: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.matches.getUpcoming()
        : apiClient.get("/matches/upcoming"),
    getByDate: (date, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.matches.getByDate(date)
        : apiClient.get(`/matches?date=${date}`),
  },

  // Analytics
  analytics: {
    getPlayerStats: (playerId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getPlayerStats?.(playerId) ||
          apiClient.get(`/analytics/players/${playerId}`)
        : apiClient.get(`/analytics/players/${playerId}`),
    getTeamStats: (teamId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getTeamStats?.(teamId) ||
          apiClient.get(`/analytics/teams/${teamId}`)
        : apiClient.get(`/analytics/teams/${teamId}`),
    getFormationStats: (formationId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getFormationStats?.(formationId) ||
          apiClient.get(`/analytics/formations/${formationId}`)
        : apiClient.get(`/analytics/formations/${formationId}`),
    getPredictions: (data, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getPredictions?.(data) ||
          apiClient.post("/analytics/predictions", data)
        : apiClient.post("/analytics/predictions", data),
    getBestPlayers: (tournamentId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getBestPlayers?.(tournamentId) ||
          apiClient.get(`/best-players?tournament_id=${tournamentId}`)
        : apiClient.get(`/best-players?tournament_id=${tournamentId}`),
    getBestPlayersByTeams: (teams, tournamentId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getBestPlayersByTeams?.(teams, tournamentId) ||
          apiClient.get(
            `/best-players?teams=${teams.join(
              ","
            )}&tournament_id=${tournamentId}`
          )
        : apiClient.get(
            `/best-players?teams=${teams.join(
              ","
            )}&tournament_id=${tournamentId}`
          ),
    getDetailedMatches: (tournamentId, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getDetailedMatches?.(tournamentId) ||
          apiClient.get(`/detailed-matches?tournament_id=${tournamentId}`)
        : apiClient.get(`/detailed-matches?tournament_id=${tournamentId}`),
    getCleanSheetsStats: (teams, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getCleanSheetsStats?.(teams) ||
          apiClient.get(`/clean-sheets-stats?teams=${teams.join(",")}`)
        : apiClient.get(`/clean-sheets-stats?teams=${teams.join(",")}`),
    getLatestScoringHistory: (tournamentId, teams, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.analytics?.getLatestScoringHistory?.(tournamentId, teams) ||
          apiClient.get(`/latest-scoring-history?tournament_id=${tournamentId}&teams=${teams.join(",")}`)
        : apiClient.get(`/latest-scoring-history?tournament_id=${tournamentId}&teams=${teams.join(",")}`),
  },

  // Tips
  tips: {
    getTips: (isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.tips.getTips()
        : apiClient.get("/tips/get-tips"),
    getTeamStatByWeek: (tournamentName, teamName, statName, playerName = null, isSubscribed = true, isFreeTrial = false) => {
      const params = new URLSearchParams({
        tournament_name: tournamentName,
        team_name: teamName,
        stat_name: statName,
      });
      if (playerName) {
        params.append("player_name", playerName);
      }
      return shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.tips?.getTeamStatByWeek?.(tournamentName, teamName, statName, playerName) ||
          apiClient.get(`/tips/team-stat-by-week?${params.toString()}`)
        : apiClient.get(`/tips/team-stat-by-week?${params.toString()}`);
    },
  },

  // Search
  search: {
    getAvailableTeams: (tournaments, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.search?.getAvailableTeams?.(tournaments) ||
          apiClient.get(`/search/available-teams?tournaments=${tournaments.join(",")}`)
        : apiClient.get(`/search/available-teams?tournaments=${tournaments.join(",")}`),
    getAvailablePlayers: (tournaments, teams, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.search?.getAvailablePlayers?.(tournaments, teams) ||
          apiClient.get(`/search/available-players?tournaments=${tournaments.join(",")}&teams=${teams.join(",")}`)
        : apiClient.get(`/search/available-players?tournaments=${tournaments.join(",")}&teams=${teams.join(",")}`),
    freeSearch: (params, isSubscribed = true, isFreeTrial = false) =>
      shouldUseMockData(isSubscribed, isFreeTrial)
        ? mockApi.search?.freeSearch?.(params) ||
          apiClient.get(`/search/free-search?${new URLSearchParams(params).toString()}`)
        : apiClient.get(`/search/free-search?${new URLSearchParams(params).toString()}`),
  },
};

export default apiClient;
