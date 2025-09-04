// API configuration for Goatip
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API client with error handling
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// API endpoints for fantasy soccer data
export const api = {
  // Players
  players: {
    getAll: () => apiClient.get('/api/players'),
    getById: (id) => apiClient.get(`/api/players/${id}`),
    getByPosition: (position) => apiClient.get(`/api/players?position=${position}`),
    getByTeam: (teamId) => apiClient.get(`/api/players?team=${teamId}`),
    getPerformance: (playerId) => apiClient.get(`/api/players/${playerId}/performance`),
  },

  // Teams
  teams: {
    getAll: () => apiClient.get('/api/teams'),
    getById: (id) => apiClient.get(`/api/teams/${id}`),
    getFixtures: (teamId) => apiClient.get(`/api/teams/${teamId}/fixtures`),
  },

  // Fantasy Teams
  fantasyTeams: {
    getAll: () => apiClient.get('/api/fantasy-teams'),
    getById: (id) => apiClient.get(`/api/fantasy-teams/${id}`),
    create: (teamData) => apiClient.post('/api/fantasy-teams', teamData),
    update: (id, teamData) => apiClient.put(`/api/fantasy-teams/${id}`, teamData),
    delete: (id) => apiClient.delete(`/api/fantasy-teams/${id}`),
    optimize: (id) => apiClient.post(`/api/fantasy-teams/${id}/optimize`),
  },

  // Formations
  formations: {
    getAll: () => apiClient.get('/api/formations'),
    getById: (id) => apiClient.get(`/api/formations/${id}`),
    getRecommended: (players) => apiClient.post('/api/formations/recommend', { players }),
  },

  // Matches
  matches: {
    getAll: () => apiClient.get('/api/matches'),
    getById: (id) => apiClient.get(`/api/matches/${id}`),
    getUpcoming: () => apiClient.get('/api/matches/upcoming'),
    getByDate: (date) => apiClient.get(`/api/matches?date=${date}`),
  },

  // Analytics
  analytics: {
    getPlayerStats: (playerId) => apiClient.get(`/api/analytics/players/${playerId}`),
    getTeamStats: (teamId) => apiClient.get(`/api/analytics/teams/${teamId}`),
    getFormationStats: (formationId) => apiClient.get(`/api/analytics/formations/${formationId}`),
    getPredictions: (data) => apiClient.post('/api/analytics/predictions', data),
  },
};

export default apiClient;
