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
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getAll?.() || apiClient.get("/players")
        : apiClient.get("/players"),
    getByTournament: (matchId, roundId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getAll?.() ||
          apiClient.post("/players", { match_id: matchId, round_id: roundId })
        : apiClient.post("/players", { match_id: matchId, round_id: roundId }),
  },

  // Teams
  teams: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getAll?.() || apiClient.get("/teams")
        : apiClient.get("/teams"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getById?.(id) || apiClient.get(`/teams/${id}`)
        : apiClient.get(`/teams/${id}`),
    getFixtures: (teamId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getFixtures?.(teamId) ||
          apiClient.get(`/teams/${teamId}/fixtures`)
        : apiClient.get(`/teams/${teamId}/fixtures`),
  },

  // Fantasy Teams
  fantasyTeams: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.getAll?.() || apiClient.get("/fantasy-teams")
        : apiClient.get("/fantasy-teams"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.getById?.(id) ||
          apiClient.get(`/fantasy-teams/${id}`)
        : apiClient.get(`/fantasy-teams/${id}`),
    create: (teamData, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.create?.(teamData) ||
          apiClient.post("/fantasy-teams", teamData)
        : apiClient.post("/fantasy-teams", teamData),
    update: (id, teamData, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.update?.(id, teamData) ||
          apiClient.put(`/fantasy-teams/${id}`, teamData)
        : apiClient.put(`/fantasy-teams/${id}`, teamData),
    delete: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.delete?.(id) ||
          apiClient.delete(`/fantasy-teams/${id}`)
        : apiClient.delete(`/fantasy-teams/${id}`),
    optimize: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.optimize?.(id) ||
          apiClient.post(`/fantasy-teams/${id}/optimize`)
        : apiClient.post(`/fantasy-teams/${id}/optimize`),
  },

  // Formations
  formations: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getAll?.() || apiClient.get("/formations")
        : apiClient.get("/formations"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getById?.(id) ||
          apiClient.get(`/formations/${id}`)
        : apiClient.get(`/formations/${id}`),
    getRecommended: (players, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getRecommended?.(players) ||
          apiClient.post("/formations/recommend", { players })
        : apiClient.post("/formations/recommend", { players }),
  },

  // Matches
  matches: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getAll()
        : apiClient.get("/matches"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getById(id)
        : apiClient.get(`/matches/${id}`),
    getUpcoming: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getUpcoming()
        : apiClient.get("/matches/upcoming"),
    getByDate: (date, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getByDate(date)
        : apiClient.get(`/matches?date=${date}`),
  },

  // Analytics
  analytics: {
    getPlayerStats: (playerId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getPlayerStats?.(playerId) ||
          apiClient.get(`/analytics/players/${playerId}`)
        : apiClient.get(`/analytics/players/${playerId}`),
    getTeamStats: (teamId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getTeamStats?.(teamId) ||
          apiClient.get(`/analytics/teams/${teamId}`)
        : apiClient.get(`/analytics/teams/${teamId}`),
    getFormationStats: (formationId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getFormationStats?.(formationId) ||
          apiClient.get(`/analytics/formations/${formationId}`)
        : apiClient.get(`/analytics/formations/${formationId}`),
    getPredictions: (data, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getPredictions?.(data) ||
          apiClient.post("/analytics/predictions", data)
        : apiClient.post("/analytics/predictions", data),
    getBestPlayers: (tournamentId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getBestPlayers?.(tournamentId) ||
          apiClient.get(`/best-players?tournament_id=${tournamentId}`)
        : apiClient.get(`/best-players?tournament_id=${tournamentId}`),
    getBestPlayersByTeams: (teams, tournamentId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
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
  },

  // Tips
  tips: {
    getTips: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.tips.getTips()
        : apiClient.get("/tips/get-tips"),
  },
};

export default apiClient;
