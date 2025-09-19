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
        ? mockApi.players?.getAll?.() || apiClient.get("/api/players")
        : apiClient.get("/api/players"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getById?.(id) || apiClient.get(`/api/players/${id}`)
        : apiClient.get(`/api/players/${id}`),
    getByPosition: (position, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getByPosition?.(position) ||
          apiClient.get(`/api/players?position=${position}`)
        : apiClient.get(`/api/players?position=${position}`),
    getByTeam: (teamId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getByTeam?.(teamId) ||
          apiClient.get(`/api/players?team=${teamId}`)
        : apiClient.get(`/api/players?team=${teamId}`),
    getPerformance: (playerId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getPerformance?.(playerId) ||
          apiClient.get(`/api/players/${playerId}/performance`)
        : apiClient.get(`/api/players/${playerId}/performance`),
    getByTournament: (tournamentId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.players?.getAll?.() ||
          apiClient.get(`/api/players?tournament_id=${tournamentId}`)
        : apiClient.get(`/api/players?tournament_id=${tournamentId}`),
  },

  // Teams
  teams: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getAll?.() || apiClient.get("/api/teams")
        : apiClient.get("/api/teams"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getById?.(id) || apiClient.get(`/api/teams/${id}`)
        : apiClient.get(`/api/teams/${id}`),
    getFixtures: (teamId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getFixtures?.(teamId) ||
          apiClient.get(`/api/teams/${teamId}/fixtures`)
        : apiClient.get(`/api/teams/${teamId}/fixtures`),
  },

  // Fantasy Teams
  fantasyTeams: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.getAll?.() ||
          apiClient.get("/api/fantasy-teams")
        : apiClient.get("/api/fantasy-teams"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.getById?.(id) ||
          apiClient.get(`/api/fantasy-teams/${id}`)
        : apiClient.get(`/api/fantasy-teams/${id}`),
    create: (teamData, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.create?.(teamData) ||
          apiClient.post("/api/fantasy-teams", teamData)
        : apiClient.post("/api/fantasy-teams", teamData),
    update: (id, teamData, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.update?.(id, teamData) ||
          apiClient.put(`/api/fantasy-teams/${id}`, teamData)
        : apiClient.put(`/api/fantasy-teams/${id}`, teamData),
    delete: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.delete?.(id) ||
          apiClient.delete(`/api/fantasy-teams/${id}`)
        : apiClient.delete(`/api/fantasy-teams/${id}`),
    optimize: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.fantasyTeams?.optimize?.(id) ||
          apiClient.post(`/api/fantasy-teams/${id}/optimize`)
        : apiClient.post(`/api/fantasy-teams/${id}/optimize`),
  },

  // Formations
  formations: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getAll?.() || apiClient.get("/api/formations")
        : apiClient.get("/api/formations"),
    getById: (id, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getById?.(id) ||
          apiClient.get(`/api/formations/${id}`)
        : apiClient.get(`/api/formations/${id}`),
    getRecommended: (players, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.formations?.getRecommended?.(players) ||
          apiClient.post("/api/formations/recommend", { players })
        : apiClient.post("/api/formations/recommend", { players }),
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
        : apiClient.get(`/api/matches/${id}`),
    getUpcoming: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getUpcoming()
        : apiClient.get("/api/matches/upcoming"),
    getByDate: (date, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getByDate(date)
        : apiClient.get(`/api/matches?date=${date}`),
  },

  // Analytics
  analytics: {
    getPlayerStats: (playerId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getPlayerStats?.(playerId) ||
          apiClient.get(`/api/analytics/players/${playerId}`)
        : apiClient.get(`/api/analytics/players/${playerId}`),
    getTeamStats: (teamId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getTeamStats?.(teamId) ||
          apiClient.get(`/api/analytics/teams/${teamId}`)
        : apiClient.get(`/api/analytics/teams/${teamId}`),
    getFormationStats: (formationId, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getFormationStats?.(formationId) ||
          apiClient.get(`/api/analytics/formations/${formationId}`)
        : apiClient.get(`/api/analytics/formations/${formationId}`),
    getPredictions: (data, isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.analytics?.getPredictions?.(data) ||
          apiClient.post("/api/analytics/predictions", data)
        : apiClient.post("/api/analytics/predictions", data),
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
