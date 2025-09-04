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
