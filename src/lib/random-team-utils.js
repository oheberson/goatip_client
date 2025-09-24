/**
 * Utility functions for random team generation
 */

// Helper function to calculate total shots (same as in player-selection-drawer.jsx)
export const calculateTotalShots = (player) => {
  const scouts = player.scouts?.total || {};
  return (
    (scouts.FD || 0) + (scouts.FF || 0) + (scouts.FT || 0) + (scouts.FB || 0)
  );
};

// Helper function to get scout value safely
export const getScoutValue = (player, key) => {
  return player.scouts?.total?.[key] || 0;
};

// Helper function to get scout average value safely
export const getScoutAverage = (player, key) => {
  return player.scouts?.average?.[key] || 0;
};

// Calculate player score based on strategy
export const calculatePlayerScore = (player, strategy) => {
  if (!player.scouts?.average) return 0;

  const averages = player.scouts.average;
  let score = 0;

  switch (strategy) {
    case "defensivo":
      // Prioritize defensive stats: DE (desarmes), IR (interceptações), SG, DS (defesas)
      score =
        (averages.DE || 0) * 2 + // Desarmes
        (averages.IR || 0) * 2 + // Interceptações
        (averages.SG || 0) * 3 + // SG (sem gols)
        (averages.DS || 0) * 2; // Defesas
      break;

    case "ofensivo":
      // Prioritize offensive stats: shots and goals
      const totalShots = calculateTotalShots(player);
      const shotsAverage = totalShots / 9; // Assuming 9 games average
      score =
        shotsAverage * 2 + // Finalizações
        (averages.G || 0) * 4 + // Gols
        (averages.FC || 0) * 1.5 + // Finalizações certas
        (averages.FS || 0) * 1; // Finalizações para fora
      break;

    case "moderado":
    default:
      // Balanced approach - use average of all stats
      const allStats = Object.values(averages).filter(
        (val) => typeof val === "number"
      );
      score =
        allStats.length > 0
          ? allStats.reduce((sum, val) => sum + val, 0) / allStats.length
          : 0;
      break;
  }

  return score;
};

// Get formation configuration
export const getFormationConfig = (formation) => {
  const FORMATION_CONFIGS = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-4-3": { defense: 3, midfield: 4, attack: 3 },
    "4-5-1": { defense: 4, midfield: 5, attack: 1 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "5-3-2": { defense: 5, midfield: 3, attack: 2 },
    "5-4-1": { defense: 5, midfield: 4, attack: 1 },
  };

  const config = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS["4-3-3"];

  const limits = {
    GOL: 1,
    ZAG: 0,
    LAT: 0,
    MEI: config.midfield,
    ATA: config.attack,
  };

  if (config.defense >= 4) {
    limits.ZAG = 2; // Center backs
    limits.LAT = 2; // Laterals
  } else {
    limits.ZAG = config.defense; // Only center backs
  }

  return limits;
};

// Filter players by position and team constraints
export const filterPlayersForPosition = (
  players,
  positionType,
  selectedTeams,
  strategy
) => {
  return players.filter((player) => {
    // Filter by position
    if (player.position !== positionType) return false;

    // Filter by selected teams
    if (selectedTeams.length > 0 && !selectedTeams.includes(player.teamName)) {
      return false;
    }

    return true;
  });
};

// Select best players for a position based on strategy
export const selectBestPlayersForPosition = (
  players,
  positionType,
  count,
  strategy
) => {
  if (players.length === 0) return [];

  // Calculate scores for all players
  const playersWithScores = players.map((player) => ({
    ...player,
    score: calculatePlayerScore(player, strategy),
  }));

  // Sort by score (descending) and take the top players
  return playersWithScores.sort((a, b) => b.score - a.score).slice(0, count);
};

// Select random players from top N players for a position based on strategy
export const selectRandomPlayersForPosition = (
  players,
  positionType,
  count,
  strategy,
  topN = 5
) => {
  if (players.length === 0) return [];

  // Calculate scores for all players
  const playersWithScores = players.map((player) => ({
    ...player,
    score: calculatePlayerScore(player, strategy),
  }));

  // Sort by score (descending) and take the top N players
  const topPlayers = playersWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(topN, players.length));

  // Randomly select from the top players
  const shuffled = [...topPlayers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Select players for defense with SG strategy (same team)
export const selectDefenseWithSG = (
  players,
  positionLimits,
  selectedTeams,
  strategy
) => {
  const defensePositions = ["GOL", "ZAG", "LAT"].filter(
    (pos) => positionLimits[pos] > 0
  );

  if (defensePositions.length === 0) return {};

  // Try to find a team that has players for all defense positions
  for (const team of selectedTeams) {
    const teamPlayers = players.filter(
      (player) =>
        player.teamName === team && defensePositions.includes(player.position)
    );

    // Check if this team has at least one player for each defense position
    const hasAllPositions = defensePositions.every((pos) =>
      teamPlayers.some((player) => player.position === pos)
    );

    if (hasAllPositions) {
      // Select the best players from this team for each position
      const selectedPlayers = {};
      let slotIndex = 1;

      for (const pos of defensePositions) {
        const posPlayers = teamPlayers.filter((p) => p.position === pos);
        const bestPlayers = selectBestPlayersForPosition(
          posPlayers,
          pos,
          positionLimits[pos],
          strategy
        );

        bestPlayers.forEach((player, index) => {
          const slotKey = `${pos}-${index + 1}`;
          selectedPlayers[slotKey] = player;
        });
      }

      return selectedPlayers;
    }
  }

  // If no team has all positions, fall back to individual selection
  return {};
};

// Generate random team based on parameters
export const generateRandomTeam = (playersData, randomParams) => {
  const {
    formation,
    useBenchStrategy,
    defenseWithSG,
    selectedTeams,
    strategy,
  } = randomParams;

  if (!playersData?.players) {
    throw new Error("No players data available");
  }

  const players = playersData.players;
  const positionLimits = getFormationConfig(formation);
  const selectedPlayers = {};
  const benchPlayers = {};

  // Calculate top N players per team for randomization
  const playersPerTeam = 8; // Top 8 players per team
  const totalTopPlayers = selectedTeams.length * playersPerTeam;

  // Handle defense with SG strategy first
  if (defenseWithSG) {
    const defensePlayers = selectDefenseWithSG(
      players,
      positionLimits,
      selectedTeams,
      strategy
    );
    Object.assign(selectedPlayers, defensePlayers);
  }

  // Select players for each position (STARTING ELEVEN FIRST)
  for (const [positionType, requiredCount] of Object.entries(positionLimits)) {
    // Skip if already handled by defense with SG
    if (
      defenseWithSG &&
      (positionType === "GOL" ||
        positionType === "ZAG" ||
        positionType === "LAT")
    ) {
      continue;
    }

    if (requiredCount === 0) continue;

    // Filter players for this position
    const availablePlayers = filterPlayersForPosition(
      players,
      positionType,
      selectedTeams,
      strategy
    ).filter(
      (player) =>
        !Object.values(selectedPlayers).some(
          (selected) => selected.id === player.id
        )
    );

    // Use randomized selection from top players
    const bestPlayers = selectRandomPlayersForPosition(
      availablePlayers,
      positionType,
      requiredCount,
      strategy,
      Math.min(totalTopPlayers, availablePlayers.length)
    );

    // Assign to slots
    bestPlayers.forEach((player, index) => {
      const slotKey = `${positionType}-${index + 1}`;
      selectedPlayers[slotKey] = {
        ...player,
        position: positionType,
      };
    });
  }

  // Handle bench strategy if enabled
  if (useBenchStrategy) {
    // For bench strategy, we need to implement the "nulo" strategy:
    // 1. Find players with "nulo" or "dúvida" status for starting eleven (1 per position)
    // 2. Find players with "Provável" status for bench (1 per position)
    // 3. Replace the current team with this strategy

    const benchPositions = ["GOL", "ZAG", "LAT", "MEI", "ATA"];

    for (const pos of benchPositions) {
      if (positionLimits[pos] > 0) {
        // Find all available players for this position
        const availablePlayers = filterPlayersForPosition(
          players,
          pos,
          selectedTeams,
          strategy
        );

        // Separate players by status
        const nuloDuvidaPlayers = availablePlayers.filter(
          (player) => player.status === "Nulo" || player.status === "Dúvida"
        );

        const provavelPlayers = availablePlayers.filter(
          (player) => player.status === "Provável"
        );

        // Remove current starting players for this position
        Object.keys(selectedPlayers).forEach((key) => {
          if (selectedPlayers[key].position === pos) {
            delete selectedPlayers[key];
          }
        });

        // If we have nulo/dúvida players, use them for starting eleven
        if (nuloDuvidaPlayers.length > 0) {
          const bestNuloDuvidaPlayer = selectRandomPlayersForPosition(
            nuloDuvidaPlayers,
            pos,
            1,
            strategy,
            Math.min(3, nuloDuvidaPlayers.length) // Random from top 3 nulo players
          )[0];

          if (bestNuloDuvidaPlayer) {
            const slotKey = `${pos}-1`;
            selectedPlayers[slotKey] = {
              ...bestNuloDuvidaPlayer,
              position: pos,
            };
          }
        }

        // Fill remaining slots for this position with regular players
        const currentCount = Object.values(selectedPlayers).filter(
          (player) => player.position === pos
        ).length;
        const remainingSlots = positionLimits[pos] - currentCount;

        if (remainingSlots > 0) {
          const regularPlayers = availablePlayers.filter(
            (player) =>
              !Object.values(selectedPlayers).some(
                (selected) => selected.id === player.id
              )
          );

          if (regularPlayers.length > 0) {
            const bestRegularPlayers = selectRandomPlayersForPosition(
              regularPlayers,
              pos,
              remainingSlots,
              strategy,
              Math.min(totalTopPlayers, regularPlayers.length)
            );

            bestRegularPlayers.forEach((player, index) => {
              const slotKey = `${pos}-${currentCount + index + 1}`;
              selectedPlayers[slotKey] = {
                ...player,
                position: pos,
              };
            });
          }
        }

        // Add provável players to bench (BENCH SELECTION AFTER STARTING ELEVEN)
        if (provavelPlayers.length > 0) {
          const bestProvavelPlayer = selectRandomPlayersForPosition(
            provavelPlayers,
            pos,
            1,
            strategy,
            Math.min(3, provavelPlayers.length) // Random from top 3 provável players
          )[0];

          if (bestProvavelPlayer) {
            const benchKey = `bench-${pos}`;
            benchPlayers[benchKey] = {
              ...bestProvavelPlayer,
              position: pos,
            };
          }
        } else {
          // If no provável players, add regular bench player
          const availableBenchPlayers = availablePlayers.filter(
            (player) =>
              !Object.values(selectedPlayers).some(
                (selected) => selected.id === player.id
              )
          );

          if (availableBenchPlayers.length > 0) {
            const bestBenchPlayer = selectRandomPlayersForPosition(
              availableBenchPlayers,
              pos,
              1,
              strategy,
              Math.min(totalTopPlayers, availableBenchPlayers.length)
            )[0];

            if (bestBenchPlayer) {
              const benchKey = `bench-${pos}`;
              benchPlayers[benchKey] = {
                ...bestBenchPlayer,
                position: pos,
              };
            }
          }
        }
      }
    }
  }

  return {
    selectedPlayers,
    benchPlayers,
    formation,
  };
};
