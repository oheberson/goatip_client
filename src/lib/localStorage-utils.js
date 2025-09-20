/**
 * LocalStorage utility functions for managing matches data
 * Provides get, set, and clear operations for matches data persistence
 */

const MATCHES_STORAGE_KEY = 'goatip_matches_data';
const MATCHES_TIMESTAMP_KEY = 'goatip_matches_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get matches data from localStorage
 * @returns {Object|null} The matches data or null if not found/expired
 */
export const getMatchesFromStorage = () => {
  try {
    const timestamp = localStorage.getItem(MATCHES_TIMESTAMP_KEY);
    const data = localStorage.getItem(MATCHES_STORAGE_KEY);
    
    if (!timestamp || !data) {
      return null;
    }
    
    // Check if data is expired
    const now = Date.now();
    const storedTime = parseInt(timestamp);
    
    if (now - storedTime > CACHE_DURATION) {
      // Data is expired, remove it
      clearMatchesFromStorage();
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting matches from localStorage:', error);
    return null;
  }
};

/**
 * Store matches data in localStorage
 * @param {Object} matchesData - The matches data to store
 * @returns {boolean} Success status
 */
export const setMatchesToStorage = (matchesData) => {
  try {
    const timestamp = Date.now().toString();
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matchesData));
    localStorage.setItem(MATCHES_TIMESTAMP_KEY, timestamp);
    return true;
  } catch (error) {
    console.error('Error storing matches to localStorage:', error);
    return false;
  }
};

/**
 * Clear matches data from localStorage
 */
export const clearMatchesFromStorage = () => {
  try {
    localStorage.removeItem(MATCHES_STORAGE_KEY);
    localStorage.removeItem(MATCHES_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing matches from localStorage:', error);
  }
};

/**
 * Get specific tournament data from stored matches
 * @param {string} tournamentId - The tournament ID to retrieve
 * @returns {Object|null} The tournament data or null if not found
 */
export const getTournamentFromStorage = (tournamentId) => {
  try {
    const matchesData = getMatchesFromStorage();
    
    if (!matchesData || !matchesData[tournamentId]) {
      return null;
    }
    
    return {
      id: tournamentId,
      ...matchesData[tournamentId]
    };
  } catch (error) {
    console.error('Error getting tournament from localStorage:', error);
    return null;
  }
};

/**
 * Check if matches data exists and is not expired
 * @returns {boolean} True if valid data exists
 */
export const hasValidMatchesData = () => {
  const data = getMatchesFromStorage();
  return data !== null;
};

/**
 * Get the age of stored matches data in minutes
 * @returns {number} Age in minutes, or -1 if no data exists
 */
export const getMatchesDataAge = () => {
  try {
    const timestamp = localStorage.getItem(MATCHES_TIMESTAMP_KEY);
    
    if (!timestamp) {
      return -1;
    }
    
    const now = Date.now();
    const storedTime = parseInt(timestamp);
    return Math.floor((now - storedTime) / (1000 * 60)); // Convert to minutes
  } catch (error) {
    console.error('Error getting matches data age:', error);
    return -1;
  }
};

// Player Filter Storage Keys
const PLAYER_FILTERS_KEY = 'goatip_player_filters';
const PLAYER_SORT_KEY = 'goatip_player_sort';

/**
 * Get player filters from localStorage
 * @returns {Object|null} The player filters or null if not found
 */
export const getPlayerFiltersFromStorage = () => {
  try {
    const data = localStorage.getItem(PLAYER_FILTERS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting player filters from localStorage:', error);
    return null;
  }
};

/**
 * Store player filters in localStorage
 * @param {Object} filters - The player filters to store
 * @returns {boolean} Success status
 */
export const setPlayerFiltersToStorage = (filters) => {
  try {
    localStorage.setItem(PLAYER_FILTERS_KEY, JSON.stringify(filters));
    return true;
  } catch (error) {
    console.error('Error storing player filters to localStorage:', error);
    return false;
  }
};

/**
 * Clear player filters from localStorage
 */
export const clearPlayerFiltersFromStorage = () => {
  try {
    localStorage.removeItem(PLAYER_FILTERS_KEY);
  } catch (error) {
    console.error('Error clearing player filters from localStorage:', error);
  }
};

/**
 * Get player sort option from localStorage
 * @returns {string|null} The player sort option or null if not found
 */
export const getPlayerSortFromStorage = () => {
  try {
    const data = localStorage.getItem(PLAYER_SORT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting player sort from localStorage:', error);
    return null;
  }
};

/**
 * Store player sort option in localStorage
 * @param {string} sortOption - The player sort option to store
 * @returns {boolean} Success status
 */
export const setPlayerSortToStorage = (sortOption) => {
  try {
    localStorage.setItem(PLAYER_SORT_KEY, JSON.stringify(sortOption));
    return true;
  } catch (error) {
    console.error('Error storing player sort to localStorage:', error);
    return false;
  }
};

/**
 * Clear player sort option from localStorage
 */
export const clearPlayerSortFromStorage = () => {
  try {
    localStorage.removeItem(PLAYER_SORT_KEY);
  } catch (error) {
    console.error('Error clearing player sort from localStorage:', error);
  }
};

// Best Players Storage Keys
const BEST_PLAYERS_STORAGE_KEY = 'goatip_best_players_data';
const BEST_PLAYERS_TIMESTAMP_KEY = 'goatip_best_players_timestamp';
const BEST_PLAYERS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get best players data from localStorage
 * @param {string} tournamentId - The tournament ID to retrieve data for
 * @returns {Object|null} The best players data or null if not found/expired
 */
export const getBestPlayersFromStorage = (tournamentId) => {
  try {
    const timestamp = localStorage.getItem(`${BEST_PLAYERS_TIMESTAMP_KEY}_${tournamentId}`);
    const data = localStorage.getItem(`${BEST_PLAYERS_STORAGE_KEY}_${tournamentId}`);
    
    if (!timestamp || !data) {
      return null;
    }
    
    // Check if data is expired
    const now = Date.now();
    const storedTime = parseInt(timestamp);
    
    if (now - storedTime > BEST_PLAYERS_CACHE_DURATION) {
      // Data is expired, remove it
      clearBestPlayersFromStorage(tournamentId);
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting best players from localStorage:', error);
    return null;
  }
};

/**
 * Store best players data in localStorage
 * @param {string} tournamentId - The tournament ID
 * @param {Object} bestPlayersData - The best players data to store
 * @returns {boolean} Success status
 */
export const setBestPlayersToStorage = (tournamentId, bestPlayersData) => {
  try {
    const timestamp = Date.now().toString();
    localStorage.setItem(`${BEST_PLAYERS_STORAGE_KEY}_${tournamentId}`, JSON.stringify(bestPlayersData));
    localStorage.setItem(`${BEST_PLAYERS_TIMESTAMP_KEY}_${tournamentId}`, timestamp);
    return true;
  } catch (error) {
    console.error('Error storing best players to localStorage:', error);
    return false;
  }
};

/**
 * Clear best players data from localStorage
 * @param {string} tournamentId - The tournament ID
 */
export const clearBestPlayersFromStorage = (tournamentId) => {
  try {
    localStorage.removeItem(`${BEST_PLAYERS_STORAGE_KEY}_${tournamentId}`);
    localStorage.removeItem(`${BEST_PLAYERS_TIMESTAMP_KEY}_${tournamentId}`);
  } catch (error) {
    console.error('Error clearing best players from localStorage:', error);
  }
};

/**
 * Check if best players data exists and is not expired
 * @param {string} tournamentId - The tournament ID
 * @returns {boolean} True if valid data exists
 */
export const hasValidBestPlayersData = (tournamentId) => {
  const data = getBestPlayersFromStorage(tournamentId);
  return data !== null;
};

// Formation Storage Keys
const FORMATIONS_STORAGE_KEY = 'goatip_formations_data';

/**
 * Get formations data from localStorage for a specific tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @returns {Object|null} The formations data or null if not found
 */
export const getFormationsFromStorage = (tournamentKey) => {
  try {
    const data = localStorage.getItem(`${FORMATIONS_STORAGE_KEY}_${tournamentKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting formations from localStorage:', error);
    return null;
  }
};

/**
 * Store formations data in localStorage for a specific tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @param {Object} formationsData - The formations data to store
 * @returns {boolean} Success status
 */
export const setFormationsToStorage = (tournamentKey, formationsData) => {
  try {
    localStorage.setItem(`${FORMATIONS_STORAGE_KEY}_${tournamentKey}`, JSON.stringify(formationsData));
    return true;
  } catch (error) {
    console.error('Error storing formations to localStorage:', error);
    return false;
  }
};

/**
 * Save a specific formation to localStorage
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @param {string} teamName - The team name (key)
 * @param {Object} formationData - The formation data to save
 * @returns {boolean} Success status
 */
export const saveFormationToStorage = (tournamentKey, teamName, formationData) => {
  try {
    const existingFormations = getFormationsFromStorage(tournamentKey) || {};
    existingFormations[teamName] = formationData;
    return setFormationsToStorage(tournamentKey, existingFormations);
  } catch (error) {
    console.error('Error saving formation to localStorage:', error);
    return false;
  }
};

/**
 * Get a specific formation from localStorage
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @param {string} teamName - The team name (key)
 * @returns {Object|null} The formation data or null if not found
 */
export const getFormationFromStorage = (tournamentKey, teamName) => {
  try {
    const formations = getFormationsFromStorage(tournamentKey);
    return formations && formations[teamName] ? formations[teamName] : null;
  } catch (error) {
    console.error('Error getting formation from localStorage:', error);
    return null;
  }
};

/**
 * Get all saved team names for a tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @returns {string[]} Array of team names
 */
export const getSavedTeamNames = (tournamentKey) => {
  try {
    const formations = getFormationsFromStorage(tournamentKey);
    return formations ? Object.keys(formations) : [];
  } catch (error) {
    console.error('Error getting saved team names:', error);
    return [];
  }
};

/**
 * Get all saved teams data for analysis
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @returns {Object} Object containing all saved teams
 */
export const getAllSavedTeams = (tournamentKey) => {
  try {
    const formations = getFormationsFromStorage(tournamentKey);
    return formations || {};
  } catch (error) {
    console.error('Error getting all saved teams:', error);
    return {};
  }
};

/**
 * Delete a specific formation from localStorage
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @param {string} teamName - The team name (key)
 * @returns {boolean} Success status
 */
export const deleteFormationFromStorage = (tournamentKey, teamName) => {
  try {
    const existingFormations = getFormationsFromStorage(tournamentKey) || {};
    delete existingFormations[teamName];
    return setFormationsToStorage(tournamentKey, existingFormations);
  } catch (error) {
    console.error('Error deleting formation from localStorage:', error);
    return false;
  }
};

/**
 * Clear all formations for a tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 */
export const clearFormationsFromStorage = (tournamentKey) => {
  try {
    localStorage.removeItem(`${FORMATIONS_STORAGE_KEY}_${tournamentKey}`);
  } catch (error) {
    console.error('Error clearing formations from localStorage:', error);
  }
};

// Random Team Parameters Storage Keys
const RANDOM_PARAMS_STORAGE_KEY = 'goatip_random_params';

/**
 * Get random team parameters from localStorage for a specific tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @returns {Object|null} The random parameters or null if not found
 */
export const getRandomParamsFromStorage = (tournamentKey) => {
  try {
    const data = localStorage.getItem(`${RANDOM_PARAMS_STORAGE_KEY}_${tournamentKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting random params from localStorage:', error);
    return null;
  }
};

/**
 * Store random team parameters in localStorage for a specific tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 * @param {Object} randomParams - The random parameters to store
 * @returns {boolean} Success status
 */
export const setRandomParamsToStorage = (tournamentKey, randomParams) => {
  try {
    localStorage.setItem(`${RANDOM_PARAMS_STORAGE_KEY}_${tournamentKey}`, JSON.stringify(randomParams));
    return true;
  } catch (error) {
    console.error('Error storing random params to localStorage:', error);
    return false;
  }
};

/**
 * Clear random team parameters from localStorage for a specific tournament
 * @param {string} tournamentKey - The unique tournament key (tournamentId + team names)
 */
export const clearRandomParamsFromStorage = (tournamentKey) => {
  try {
    localStorage.removeItem(`${RANDOM_PARAMS_STORAGE_KEY}_${tournamentKey}`);
  } catch (error) {
    console.error('Error clearing random params from localStorage:', error);
  }
};

// Detailed Matches Storage Keys
const DETAILED_MATCHES_STORAGE_KEY = 'goatip_detailed_matches_data';
const DETAILED_MATCHES_TIMESTAMP_KEY = 'goatip_detailed_matches_timestamp';
const DETAILED_MATCHES_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Get detailed matches data from localStorage
 * @param {string} tournamentId - The tournament ID to retrieve data for
 * @returns {Object|null} The detailed matches data or null if not found/expired
 */
export const getDetailedMatchesFromStorage = (tournamentId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `${DETAILED_MATCHES_STORAGE_KEY}_${today}_${tournamentId}`;
    const timestampKey = `${DETAILED_MATCHES_TIMESTAMP_KEY}_${today}_${tournamentId}`;
    
    const timestamp = localStorage.getItem(timestampKey);
    const data = localStorage.getItem(storageKey);
    
    if (!timestamp || !data) {
      return null;
    }
    
    // Check if data is expired
    const now = Date.now();
    const storedTime = parseInt(timestamp);
    
    if (now - storedTime > DETAILED_MATCHES_CACHE_DURATION) {
      // Data is expired, remove it
      clearDetailedMatchesFromStorage(tournamentId);
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting detailed matches from localStorage:', error);
    return null;
  }
};

/**
 * Store detailed matches data in localStorage
 * @param {string} tournamentId - The tournament ID
 * @param {Object} detailedMatchesData - The detailed matches data to store
 * @returns {boolean} Success status
 */
export const setDetailedMatchesToStorage = (tournamentId, detailedMatchesData) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `${DETAILED_MATCHES_STORAGE_KEY}_${today}_${tournamentId}`;
    const timestampKey = `${DETAILED_MATCHES_TIMESTAMP_KEY}_${today}_${tournamentId}`;
    
    const timestamp = Date.now().toString();
    localStorage.setItem(storageKey, JSON.stringify(detailedMatchesData));
    localStorage.setItem(timestampKey, timestamp);
    return true;
  } catch (error) {
    console.error('Error storing detailed matches to localStorage:', error);
    return false;
  }
};

/**
 * Clear detailed matches data from localStorage
 * @param {string} tournamentId - The tournament ID
 */
export const clearDetailedMatchesFromStorage = (tournamentId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `${DETAILED_MATCHES_STORAGE_KEY}_${today}_${tournamentId}`;
    const timestampKey = `${DETAILED_MATCHES_TIMESTAMP_KEY}_${today}_${tournamentId}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
  } catch (error) {
    console.error('Error clearing detailed matches from localStorage:', error);
  }
};

/**
 * Check if detailed matches data exists and is not expired
 * @param {string} tournamentId - The tournament ID
 * @returns {boolean} True if valid data exists
 */
export const hasValidDetailedMatchesData = (tournamentId) => {
  const data = getDetailedMatchesFromStorage(tournamentId);
  return data !== null;
};

/**
 * Clear ALL localStorage data related to the Goatip application
 * This function removes all stored data to prevent conflicts between different user sessions
 * Should be called when a user logs in to ensure a clean state
 */
export const clearAllGoatipStorage = () => {
  try {
    // Clear all localStorage keys that start with 'goatip_'
    const keysToRemove = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('goatip_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all goatip-related keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`🧹 Cleared ${keysToRemove.length} localStorage items for clean session`);
    
    // Also clear any other potential session-related data
    // Remove common session storage keys that might interfere
    const sessionKeys = [
      'supabase.auth.token',
      'sb-',
      'auth-token',
      'session',
      'user',
      'subscription',
      'trial'
    ];
    
    sessionKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        // Also check for keys that contain these patterns
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.includes(key)) {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        // Ignore errors for individual key removal
        console.warn(`Could not remove key ${key}:`, error);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing all Goatip storage:', error);
    return false;
  }
};

/**
 * Clear localStorage data for a specific user session
 * This is a more targeted approach that only clears user-specific data
 * while preserving some application settings
 */
export const clearUserSessionData = () => {
  try {
    // Clear user-specific data but keep some app preferences
    const userSpecificKeys = [
      'goatip_matches_data',
      'goatip_matches_timestamp',
      'goatip_best_players_data',
      'goatip_best_players_timestamp',
      'goatip_detailed_matches_data',
      'goatip_detailed_matches_timestamp',
      'goatip_formations_data',
      'goatip_random_params'
    ];
    
    userSpecificKeys.forEach(key => {
      localStorage.removeItem(key);
      // Also remove keys with tournament/date suffixes
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(key)) {
          localStorage.removeItem(storageKey);
        }
      }
    });
    
    // Clear Supabase auth tokens
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        authKeys.push(key);
      }
    }
    
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log(`🧹 Cleared user session data (${userSpecificKeys.length + authKeys.length} items)`);
    
    return true;
  } catch (error) {
    console.error('Error clearing user session data:', error);
    return false;
  }
};
