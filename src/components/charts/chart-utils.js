// Utility function to transform player data grouped by position
export function transformPlayerDataByPosition(players) {
  const positionGroups = {};

  players.forEach((player) => {
    const position = player.pos;
    if (!positionGroups[position] && position != "GK") {
      positionGroups[position] = {
        position,
        totalScore: 0,
        playerCount: 0,
        averageScore: 0,
      };
    }

    if (position != "GK") {
      positionGroups[position].totalScore += player.weighted_fantasy_score;
      positionGroups[position].playerCount += 1;
    }
  });

  // Calculate averages and add fill property
  Object.values(positionGroups).forEach((group) => {
    group.averageScore = group.totalScore / group.playerCount;
    group.fill = "var(--color-averageScore)";
  });

  // Convert to array and sort by average score
  return Object.values(positionGroups).sort(
    (a, b) => b.averageScore - a.averageScore
  );
}

// Chart configuration for position statistics
export const positionChartConfig = {
  averageScore: {
    label: "Pontos Médios",
    color: "hsl(var(--primary))",
  },
};
