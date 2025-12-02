import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPlayerName = (name) => {
  if (!name) return "";

  const nameParts = name.trim().split(" ");

  // If single name, return as is
  if (nameParts.length === 1) {
    return nameParts[0];
  }

  // If multiple names, use first letter of first name + last name
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  return `${firstName[0].toUpperCase()}. ${lastName}`;
};

/**
 * Generates a normalized matchup name from tip data.
 * Format: "Home Team x Away Team"
 * Both "Team A x Team B" and "Team B x Team A" are normalized to the same matchup.
 * @param {Object} tip - Tip object with team, opponent, and is_home fields
 * @returns {string|null} - Normalized matchup name or null if data is incomplete
 */
export const getMatchupName = (tip) => {
  if (!tip || !tip.team || !tip.opponent) {
    return null;
  }

  const homeTeam = tip.is_home ? tip.team : tip.opponent;
  const awayTeam = tip.is_home ? tip.opponent : tip.team;

  return `${homeTeam} x ${awayTeam}`;
};

/**
 * Extracts unique matchups from an array of tips.
 * @param {Array} tips - Array of tip objects
 * @returns {Array} - Sorted array of unique matchup names
 */
export const getUniqueMatchups = (tips) => {
  if (!tips || !Array.isArray(tips)) {
    return [];
  }

  const matchups = new Set();
  
  tips.forEach((tip) => {
    const matchup = getMatchupName(tip);
    if (matchup) {
      matchups.add(matchup);
    }
  });

  return Array.from(matchups).sort();
};

/**
 * Gets the end of day timestamp for Brazilian timezone (UTC-3)
 * @returns {number} - Timestamp for 23:59:59 Brazilian time today
 */
export const getEndOfDayBrazilianTime = () => {
  // Brazilian timezone is UTC-3
  const now = new Date();
  const brazilianTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  // Set to end of day (23:59:59)
  brazilianTime.setHours(23, 59, 59, 999);
  
  // Convert back to UTC for storage
  const utcOffset = now.getTime() - brazilianTime.getTime();
  return brazilianTime.getTime() + utcOffset;
};

/**
 * Stores tips data in localStorage with expiration at end of day (Brazilian time)
 * @param {Object} data - Tips data to store
 */
export const storeTipsData = (data) => {
  try {
    const expirationTime = getEndOfDayBrazilianTime();
    const storageData = {
      data,
      expirationTime,
    };
    localStorage.setItem("tips_data", JSON.stringify(storageData));
  } catch (error) {
    console.error("Failed to store tips data:", error);
  }
};

/**
 * Retrieves tips data from localStorage if not expired
 * @returns {Object|null} - Tips data if valid, null otherwise
 */
export const getStoredTipsData = () => {
  try {
    const stored = localStorage.getItem("tips_data");
    if (!stored) return null;

    const { data, expirationTime } = JSON.parse(stored);
    const now = Date.now();

    // Check if data is still valid (not expired)
    if (now < expirationTime) {
      return data;
    }

    // Data expired, remove it
    localStorage.removeItem("tips_data");
    return null;
  } catch (error) {
    console.error("Failed to retrieve tips data:", error);
    localStorage.removeItem("tips_data");
    return null;
  }
};
