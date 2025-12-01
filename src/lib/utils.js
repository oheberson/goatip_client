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
