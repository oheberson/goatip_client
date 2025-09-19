// Utility functions for loading mocked data when user is not subscribed

import matchesMockData from "@/mocked_data/matches_mocked_data.json";
import tipsMockData from "@/mocked_data/get_tips_mocked_data.json";
import playersMockData from "@/mocked_data/players_mocked_data.json";
import bestPlayersMockData from "@/mocked_data/best_players_mocked_data.json";

// Simulate API delay for realistic demo experience
const simulateApiDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockApi = {
  // Mock matches API
  matches: {
    getAll: async () => {
      await simulateApiDelay();
      return matchesMockData;
    },
    getById: async (id) => {
      await simulateApiDelay();
      // Find match by ID across all tournaments
      for (const tournamentData of Object.values(matchesMockData)) {
        const match = tournamentData.matches.find((m) => m.id === parseInt(id));
        if (match) return match;
      }
      throw new Error("Match not found");
    },
    getUpcoming: async () => {
      await simulateApiDelay();
      const upcomingMatches = {};
      Object.entries(matchesMockData).forEach(([tournamentId, data]) => {
        upcomingMatches[tournamentId] = {
          ...data,
          matches: data.matches.filter((match) => match.status === "upcoming"),
        };
      });
      return upcomingMatches;
    },
    getByDate: async (date) => {
      await simulateApiDelay();
      const matchesByDate = {};
      Object.entries(matchesMockData).forEach(([tournamentId, data]) => {
        const matchesOnDate = data.matches.filter(
          (match) => match.date === date
        );
        if (matchesOnDate.length > 0) {
          matchesByDate[tournamentId] = {
            ...data,
            matches: matchesOnDate,
          };
        }
      });
      return matchesByDate;
    },
  },

  // Mock tips API
  tips: {
    getTips: async () => {
      await simulateApiDelay();
      return tipsMockData;
    },
  },

  // Mock players API
  players: {
    getAll: async () => {
      await simulateApiDelay();
      return playersMockData;
    },
    getById: async (id) => {
      await simulateApiDelay();
      const player = playersMockData.players?.find(p => p.id === id);
      return player || null;
    },
    getByPosition: async (position) => {
      await simulateApiDelay();
      const filteredPlayers = playersMockData.players?.filter(p => p.position === position) || [];
      return {
        ...playersMockData,
        players: filteredPlayers,
        total_players: filteredPlayers.length
      };
    },
    getByTeam: async (teamId) => {
      await simulateApiDelay();
      const filteredPlayers = playersMockData.players?.filter(p => p.teamId === teamId) || [];
      return {
        ...playersMockData,
        players: filteredPlayers,
        total_players: filteredPlayers.length
      };
    },
    getPerformance: async (playerId) => {
      await simulateApiDelay();
      const player = playersMockData.players?.find(p => p.id === playerId);
      if (!player) return null;
      
      return {
        player: {
          ...player,
          performance: {
            average_points: player.average || 0,
            total_points: player.points || 0,
            price: player.price || 4000,
            status: player.status || "Provável"
          }
        }
      };
    },
    getByTournament: async (matchId, roundId) => {
      await simulateApiDelay();
      // For mock data, we'll return all players since we don't have match-specific filtering
      // In a real implementation, this would filter by matchId and roundId
      return playersMockData;
    },
  },

  // Mock best players API (for fantasy team creation)
  bestPlayers: {
    getBestPlayers: async () => {
      await simulateApiDelay();
      return bestPlayersMockData;
    },
  },

  // Mock teams API
  teams: {
    getAll: async () => {
      await simulateApiDelay();
      // Extract unique teams from players data
      const teams = [...new Set(playersMockData.players?.map(p => ({
        id: p.teamId,
        name: p.teamName,
        shortName: p.teamShortName,
        logoUrl: p.firstTeamLogoUrl
      })))];
      return teams.filter(team => team.id); // Remove duplicates and invalid teams
    },
    getById: async (id) => {
      await simulateApiDelay();
      const teamPlayers = playersMockData.players?.filter(p => p.teamId === id) || [];
      if (teamPlayers.length === 0) return null;
      
      const firstPlayer = teamPlayers[0];
      return {
        id: firstPlayer.teamId,
        name: firstPlayer.teamName,
        shortName: firstPlayer.teamShortName,
        logoUrl: firstPlayer.firstTeamLogoUrl,
        players: teamPlayers
      };
    },
    getFixtures: async (teamId) => {
      await simulateApiDelay();
      // Return mock fixtures for the team
      return {
        teamId,
        fixtures: [
          {
            id: `fixture-${teamId}-1`,
            opponent: "Mock Team",
            date: "2025-01-20",
            isHome: true
          }
        ]
      };
    },
  },

  // Mock fantasy teams API
  fantasyTeams: {
    getAll: async () => {
      await simulateApiDelay();
      return [];
    },
    getById: async (id) => {
      await simulateApiDelay();
      return null;
    },
    create: async (teamData) => {
      await simulateApiDelay();
      return { id: 'mock-team-id', ...teamData };
    },
    update: async (id, teamData) => {
      await simulateApiDelay();
      return { id, ...teamData };
    },
    delete: async (id) => {
      await simulateApiDelay();
      return { success: true };
    },
    optimize: async (id) => {
      await simulateApiDelay();
      return { optimized: true, teamId: id };
    },
  },

  // Mock formations API
  formations: {
    getAll: async () => {
      await simulateApiDelay();
      return [
        { id: '4-4-2', name: '4-4-2', positions: ['GK', 'LAT', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA'] },
        { id: '4-3-3', name: '4-3-3', positions: ['GK', 'LAT', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA'] },
        { id: '3-5-2', name: '3-5-2', positions: ['GK', 'ZAG', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'LAT', 'ATA', 'ATA'] }
      ];
    },
    getById: async (id) => {
      await simulateApiDelay();
      const formations = [
        { id: '4-4-2', name: '4-4-2', positions: ['GK', 'LAT', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA'] },
        { id: '4-3-3', name: '4-3-3', positions: ['GK', 'LAT', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA'] },
        { id: '3-5-2', name: '3-5-2', positions: ['GK', 'ZAG', 'ZAG', 'ZAG', 'LAT', 'MEI', 'MEI', 'MEI', 'LAT', 'ATA', 'ATA'] }
      ];
      return formations.find(f => f.id === id) || null;
    },
    getRecommended: async (players) => {
      await simulateApiDelay();
      return { recommended: '4-4-2', confidence: 0.85 };
    },
  },

  // Mock analytics API
  analytics: {
    getPlayerStats: async (playerId) => {
      await simulateApiDelay();
      return {
        playerId,
        stats: {
          average_points: 5.2,
          total_matches: 10,
          best_performance: 12.5,
          consistency: 0.8
        }
      };
    },
    getTeamStats: async (teamId) => {
      await simulateApiDelay();
      return {
        teamId,
        stats: {
          average_goals: 1.8,
          average_conceded: 1.2,
          win_rate: 0.6
        }
      };
    },
    getFormationStats: async (formationId) => {
      await simulateApiDelay();
      return {
        formationId,
        stats: {
          average_points: 65.5,
          popularity: 0.3,
          win_rate: 0.55
        }
      };
    },
    getPredictions: async (data) => {
      await simulateApiDelay();
      return {
        predictions: [
          { player: 'Mock Player 1', predicted_points: 8.5, confidence: 0.8 },
          { player: 'Mock Player 2', predicted_points: 7.2, confidence: 0.7 }
        ]
      };
    },
    getBestPlayersByTeams: async (teams, tournamentId) => {
      await simulateApiDelay();
      return bestPlayersMockData;
    },
  },
};

// Helper function to determine if we should use mock data
export const shouldUseMockData = (isSubscribed) => {
  return !isSubscribed;
};
