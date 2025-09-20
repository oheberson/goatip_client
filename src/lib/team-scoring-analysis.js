/**
 * Team Scoring Analysis Utility
 * 
 * This utility analyzes detailed soccer match data to rank teams by their likelihood to score
 * and predict the best scoring moments. It considers various statistical factors including
 * goals percentage, timing patterns, and opponent weaknesses.
 */

import { mapTeamName } from "@/lib/constants";

/**
 * Parse statistical values from the API data
 * Handles both percentage values (e.g., "45%") and decimal values (e.g., "1,5" or "1.5")
 */
const parseStatValue = (value) => {
  if (!value || value === "null" || value === "") return 0;
  
  if (typeof value === "string") {
    if (value.includes("%")) {
      return parseFloat(value.replace("%", "").trim()) / 100;
    }
    return parseFloat(value.replace(",", ".").trim());
  }
  
  return typeof value === "number" ? value : 0;
};

/**
 * Extract goal timing insights for a specific team and context
 */
const extractGoalTimingInsights = (matchData, prefix) => {
  const scored = {};
  const against = {};

  const timingRegex = new RegExp(
    `^${prefix}\\.goals_timing\\.(\\d+ - \\d+)\\.(scored|against)$`
  );

  // Process all keys in the match data
  Object.entries(matchData).forEach(([key, value]) => {
    const match = key.match(timingRegex);
    if (!match) return;

    const interval = match[1];
    const type = match[2];
    const numValue = parseInt(value, 10) || 0;

    if (type === "scored") {
      scored[interval] = (scored[interval] || 0) + numValue;
    } else if (type === "against") {
      against[interval] = (against[interval] || 0) + numValue;
    }
  });

  // Calculate total goals
  const totalScored = Object.values(scored).reduce((a, b) => a + b, 0);
  const totalAgainst = Object.values(against).reduce((a, b) => a + b, 0);

  // Find top scoring period
  let topScoredPeriod = null;
  let topScoredValue = 0;
  let topScoredPercentage = 0;

  for (const [interval, val] of Object.entries(scored)) {
    if (val > topScoredValue) {
      topScoredValue = val;
      topScoredPeriod = interval;
      topScoredPercentage = totalScored > 0 ? val / totalScored : 0;
    }
  }

  // Find top conceding period
  let topAgainstPeriod = null;
  let topAgainstValue = 0;
  let topAgainstPercentage = 0;

  for (const [interval, val] of Object.entries(against)) {
    if (val > topAgainstValue) {
      topAgainstValue = val;
      topAgainstPeriod = interval;
      topAgainstPercentage = totalAgainst > 0 ? val / totalAgainst : 0;
    }
  }

  return {
    top_scored_period: topScoredPeriod,
    top_scored_percentage: topScoredPercentage,
    top_scored_count: topScoredValue,
    top_against_period: topAgainstPeriod,
    top_against_percentage: topAgainstPercentage,
    top_against_count: topAgainstValue,
    total_scored: totalScored,
    total_against: totalAgainst,
    scored_by_period: scored,
    against_by_period: against,
  };
};

/**
 * Determine the scoring moment category based on timing periods
 */
const categorizeScoringMoment = (period) => {
  if (!period) return "No specific moment";
  
  // First half periods
  if (["0 - 15", "16 - 30", "31 - 45"].includes(period)) {
    return "1T";
  }
  
  // Second half periods
  if (["46 - 60", "61 - 75", "76 - 90"].includes(period)) {
    return "2T";
  }
  
  return "No specific moment";
};

/**
 * Calculate team scoring score based on various statistical factors
 */
const calculateTeamScoringScore = (teamData, statsToAnalyze) => {
  let totalScore = 0;
  let weightSum = 0;

  // Define weights for different statistical categories
  const weights = {
    goals_percentage: 0.25,      // Overall goal percentages
    goals_scored: 0.20,          // Goals scored specifically
    goals_against_opponent: 0.15, // Opponent's defensive weakness
    timing_alignment: 0.20,      // Timing pattern alignment
    consistency: 0.20,           // Consistency across different stats
  };

  // 1. Goals percentage analysis (overall and detalhado)
  const goalsPercentageScore = calculateGoalsPercentageScore(teamData, statsToAnalyze);
  totalScore += goalsPercentageScore * weights.goals_percentage;
  weightSum += weights.goals_percentage;

  // 2. Goals scored analysis
  const goalsScoredScore = calculateGoalsScoredScore(teamData, statsToAnalyze);
  totalScore += goalsScoredScore * weights.goals_scored;
  weightSum += weights.goals_scored;

  // 3. Opponent defensive weakness analysis
  const opponentWeaknessScore = calculateOpponentWeaknessScore(teamData, statsToAnalyze);
  totalScore += opponentWeaknessScore * weights.goals_against_opponent;
  weightSum += weights.goals_against_opponent;

  // 4. Timing alignment analysis
  const timingAlignmentScore = calculateTimingAlignmentScore(teamData);
  totalScore += timingAlignmentScore * weights.timing_alignment;
  weightSum += weights.timing_alignment;

  // 5. Consistency analysis
  const consistencyScore = calculateConsistencyScore(teamData, statsToAnalyze);
  totalScore += consistencyScore * weights.consistency;
  weightSum += weights.consistency;

  // Normalize the score
  return weightSum > 0 ? totalScore / weightSum : 0;
};

/**
 * Calculate goals percentage score
 */
const calculateGoalsPercentageScore = (teamData, statsToAnalyze) => {
  let score = 0;
  let count = 0;

  // Analyze over_X_goals_percentage stats
  const goalsPercentageStats = [
    "over_05_goals_percentage",
    "over_15_goals_percentage", 
    "over_25_goals_percentage"
  ];

  goalsPercentageStats.forEach(stat => {
    const overallValue = parseStatValue(teamData.overall[stat]);
    const detalhadoValue = parseStatValue(teamData.detalhado[stat]);
    
    // Weight overall more heavily than detalhado
    const weightedValue = (overallValue * 0.6) + (detalhadoValue * 0.4);
    score += weightedValue;
    count++;
  });

  return count > 0 ? score / count : 0;
};

/**
 * Calculate goals scored score
 */
const calculateGoalsScoredScore = (teamData, statsToAnalyze) => {
  let score = 0;
  let count = 0;

  const goalsScoredStats = [
    "over_05_goals_scored_percentage",
    "over_15_goals_scored_percentage",
    "over_25_goals_scored_percentage"
  ];

  goalsScoredStats.forEach(stat => {
    const overallValue = parseStatValue(teamData.overall[stat]);
    const detalhadoValue = parseStatValue(teamData.detalhado[stat]);
    
    const weightedValue = (overallValue * 0.6) + (detalhadoValue * 0.4);
    score += weightedValue;
    count++;
  });

  return count > 0 ? score / count : 0;
};

/**
 * Calculate opponent defensive weakness score
 */
const calculateOpponentWeaknessScore = (teamData, statsToAnalyze) => {
  if (!teamData.opponent) return 0;

  let score = 0;
  let count = 0;

  const opponentWeaknessStats = [
    "over_05_goals_against_percentage",
    "over_15_goals_against_percentage",
    "over_25_goals_against_percentage"
  ];

  opponentWeaknessStats.forEach(stat => {
    const overallValue = parseStatValue(teamData.opponent.overall[stat]);
    const detalhadoValue = parseStatValue(teamData.opponent.detalhado[stat]);
    
    const weightedValue = (overallValue * 0.6) + (detalhadoValue * 0.4);
    score += weightedValue;
    count++;
  });

  return count > 0 ? score / count : 0;
};

/**
 * Calculate timing alignment score
 */
const calculateTimingAlignmentScore = (teamData) => {
  if (!teamData.timing || !teamData.opponent?.timing) return 0;

  const teamScoredPeriod = teamData.timing.top_scored_period;
  const opponentAgainstPeriod = teamData.opponent.timing.top_against_period;

  if (!teamScoredPeriod || !opponentAgainstPeriod) return 0;

  // Check if timing periods align (both in 1st half or both in 2nd half)
  const teamMoment = categorizeScoringMoment(teamScoredPeriod);
  const opponentMoment = categorizeScoringMoment(opponentAgainstPeriod);

  if (teamMoment === opponentMoment && teamMoment !== "No specific moment") {
    // Perfect alignment - both teams have patterns in the same half
    const teamStrength = teamData.timing.top_scored_percentage;
    const opponentWeakness = teamData.opponent.timing.top_against_percentage;
    return (teamStrength + opponentWeakness) / 2;
  }

  return 0;
};

/**
 * Calculate consistency score
 */
const calculateConsistencyScore = (teamData, statsToAnalyze) => {
  // Calculate variance across different statistical categories
  const scores = [];
  
  // Add goals percentage scores
  scores.push(calculateGoalsPercentageScore(teamData, statsToAnalyze));
  scores.push(calculateGoalsScoredScore(teamData, statsToAnalyze));
  scores.push(calculateOpponentWeaknessScore(teamData, statsToAnalyze));
  
  // Calculate consistency as inverse of variance
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
  
  // Higher consistency (lower variance) should result in higher score
  return Math.max(0, 1 - Math.sqrt(variance));
};

/**
 * Estimate likely goals based on scoring score and historical data
 */
const estimateLikelyGoals = (scoringScore, teamData) => {
  // Base estimation on scoring score and actual goal data
  const baseEstimation = scoringScore * 3; // Scale to 0-3 goals range
  
  // Adjust based on actual goal counts from timing data
  const totalScored = teamData.timing?.total_scored || 0;
  const totalAgainst = teamData.timing?.total_against || 0;
  
  // Factor in goal difference and total goals
  const goalFactor = Math.max(0.1, (totalScored - totalAgainst + 1) / 10);
  
  const estimated = baseEstimation * goalFactor;
  
  // Round to reasonable values
  if (estimated < 0.5) return Math.round(estimated * 10) / 10;
  if (estimated < 1) return Math.round(estimated * 2) / 2;
  return Math.round(estimated);
};

/**
 * Main function to analyze team scoring likelihood
 */
export const analyzeTeamScoringLikelihood = (detailedMatchesData, uniqueTeams) => {
  if (!detailedMatchesData || detailedMatchesData.length === 0 || !uniqueTeams || uniqueTeams.length === 0) {
    return [];
  }

  const statsToLookFor = [
    "over_05_goals_percentage",
    "over_15_goals_percentage",
    "over_25_goals_percentage",
    "over_05_goals_scored_percentage",
    "over_15_goals_scored_percentage",
    "over_25_goals_scored_percentage",
    "over_05_goals_against_percentage",
    "over_15_goals_against_percentage",
    "over_25_goals_against_percentage",
  ];

  // Process each match and extract team data
  const teamDataMap = new Map();

  detailedMatchesData.forEach((match) => {
    const mandante = mapTeamName(match.mandante_name);
    const visitante = mapTeamName(match.visitante_name);

    // Only process matches with teams in our unique teams list
    if (!uniqueTeams.includes(mandante) || !uniqueTeams.includes(visitante)) {
      return;
    }

    // Initialize team data if not exists
    if (!teamDataMap.has(mandante)) {
      teamDataMap.set(mandante, {
        team: mandante,
        overall: {},
        detalhado: {},
        timing: null,
        opponent: null,
        matches: 0,
      });
    }

    if (!teamDataMap.has(visitante)) {
      teamDataMap.set(visitante, {
        team: visitante,
        overall: {},
        detalhado: {},
        timing: null,
        opponent: null,
        matches: 0,
      });
    }

    // Extract statistical data for mandante
    const mandanteData = teamDataMap.get(mandante);
    const visitanteData = teamDataMap.get(visitante);

    // Process stats for mandante (home team)
    statsToLookFor.forEach((statName) => {
      const overallKey = `overall_mandante_infos.stats.${statName}`;
      const detalhadoKey = `detalhado_mandante_infos.stats.${statName}`;

      mandanteData.overall[statName] = match[overallKey];
      mandanteData.detalhado[statName] = match[detalhadoKey];
    });

    // Process stats for visitante (away team)
    statsToLookFor.forEach((statName) => {
      const overallKey = `overall_visitante_infos.stats.${statName}`;
      const detalhadoKey = `detalhado_visitante_infos.stats.${statName}`;

      visitanteData.overall[statName] = match[overallKey];
      visitanteData.detalhado[statName] = match[detalhadoKey];
    });

    // Extract timing data
    mandanteData.timing = extractGoalTimingInsights(match, "overall_mandante_infos");
    visitanteData.timing = extractGoalTimingInsights(match, "overall_visitante_infos");

    // Set opponent references for this match
    mandanteData.opponent = {
      team: visitante,
      overall: visitanteData.overall,
      detalhado: visitanteData.detalhado,
      timing: visitanteData.timing,
    };

    visitanteData.opponent = {
      team: mandante,
      overall: mandanteData.overall,
      detalhado: mandanteData.detalhado,
      timing: mandanteData.timing,
    };

    // Increment match count
    mandanteData.matches++;
    visitanteData.matches++;
  });

  // Calculate scoring scores for each team
  const teamScores = [];
  
  teamDataMap.forEach((teamData, teamName) => {
    if (teamData.matches > 0) {
      const scoringScore = calculateTeamScoringScore(teamData, statsToLookFor);
      const likelyGoals = estimateLikelyGoals(scoringScore, teamData);
      const momentForScoring = categorizeScoringMoment(teamData.timing?.top_scored_period);

      teamScores.push({
        team: teamName,
        moment_for_scoring: momentForScoring,
        likely_goals: likelyGoals,
        scoring_score: scoringScore,
        timing_insights: teamData.timing,
        opponent_weakness: teamData.opponent?.timing?.top_against_percentage || 0,
      });
    }
  });

  // Sort by likely goals (highest first) since that's what we display to users
  teamScores.sort((a, b) => b.likely_goals - a.likely_goals);

  // Return simplified format for the UI
  return teamScores.map(({ team, moment_for_scoring, likely_goals }) => ({
    team,
    moment_for_scoring,
    likely_goals,
  }));
};

/**
 * Get detailed analysis for a specific team
 */
export const getTeamDetailedAnalysis = (detailedMatchesData, teamName, uniqueTeams) => {
  if (!detailedMatchesData || detailedMatchesData.length === 0) {
    return null;
  }

  const mappedTeamName = mapTeamName(teamName);
  if (!uniqueTeams.includes(mappedTeamName)) {
    return null;
  }

  // Find all matches for this team
  const teamMatches = detailedMatchesData.filter(match => 
    mapTeamName(match.mandante_name) === mappedTeamName || 
    mapTeamName(match.visitante_name) === mappedTeamName
  );

  if (teamMatches.length === 0) {
    return null;
  }

  // Analyze the team's performance
  const analysis = {
    team: mappedTeamName,
    total_matches: teamMatches.length,
    overall_performance: {},
    timing_patterns: {},
    opponent_analysis: {},
  };

  // This would contain more detailed analysis logic
  // For now, return basic structure
  return analysis;
};
