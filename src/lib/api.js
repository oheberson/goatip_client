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
  },

  // Teams
  teams: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.teams?.getAll?.() || apiClient.get("/teams")
        : apiClient.get("/teams"),
  },

  // Matches
  matches: {
    getAll: (isSubscribed = true) =>
      shouldUseMockData(isSubscribed)
        ? mockApi.matches.getAll()
        : apiClient.get("/matches"),
  },

  // Analytics
  analytics: {
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
