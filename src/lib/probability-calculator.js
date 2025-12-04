/**
 * Helper function - binomial coefficient C(n,k) using multiplicative formula (avoids big numbers)
 */
function binomialCoefficient(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k); // take advantage of symmetry
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= n - i;
    result /= i + 1;
  }
  return result;
}

/**
 * Calculates the probability that a player achieves AT LEAST targetCount
 * of a certain stat (e.g. tackles) in their next match using Negative Binomial.
 *
 * @param {Object} options
 * @param {number[]} options.pastCounts - Array of stat counts in last N games (most recent last)
 * @param {('home'|'away')[]} options.venues - Venue for each past game ('home' or 'away')
 * @param {'home'|'away'} options.nextVenue - Venue of the upcoming match
 * @param {number} options.targetCount - We want P(X >= targetCount), e.g. 3 tackles
 * @param {number[]} [options.minutesPlayed] - Optional: minutes played each game (for per-90 normalization)
 * @param {number} [options.weightHalfLife=6] - Recent form weighting: higher = more recent bias
 * @returns {Object} { probabilityAtLeast, mean, variance, dispersionK, effectiveLambda }
 */
export function calculateNegativeBinomialPlayerProp({
  pastCounts,
  venues,
  nextVenue,
  targetCount,
  minutesPlayed = null,
  weightHalfLife = 6,
}) {
  if (pastCounts.length < 4) {
    throw new Error("Need at least 4 games for reliable Negative Binomial fit");
  }

  // Step 1: Normalize to per-90 if minutes are provided
  let normalizedCounts = pastCounts;
  if (minutesPlayed && minutesPlayed.length === pastCounts.length) {
    normalizedCounts = pastCounts.map((count, i) => {
      const mins = minutesPlayed[i];
      return mins > 0 ? count * (90 / mins) : 0;
    });
  }

  // Step 2: Apply exponential recency weighting + home/away adjustment
  const n = normalizedCounts.length;
  let weightedSum = 0;
  let weightTotal = 0;
  let weightedSumHome = 0;
  let weightTotalHome = 0;
  let weightedSumAway = 0;
  let weightTotalAway = 0;

  for (let i = 0; i < n; i++) {
    // Recency weight: exponential decay, most recent game has highest weight
    const recencyWeight = Math.pow(2, (i + 1) / weightHalfLife); // doubles every ~4.2 games back
    if (venues[i] === "home") {
      weightedSumHome += normalizedCounts[i] * recencyWeight;
      weightTotalHome += recencyWeight;
    } else {
      weightedSumAway += normalizedCounts[i] * recencyWeight;
      weightTotalAway += recencyWeight;
    }
    weightedSum += normalizedCounts[i] * recencyWeight;
    weightTotal += recencyWeight;
  }

  // Step 3: Predict lambda for next match (venue-adjusted)
  const avgHome =
    weightTotalHome > 0 ? weightedSumHome / weightTotalHome : null;
  const avgAway =
    weightTotalAway > 0 ? weightedSumAway / weightTotalAway : null;
  let lambda;

  if (nextVenue === "home" && avgHome !== null) {
    lambda = avgHome;
  } else if (nextVenue === "away" && avgAway !== null) {
    lambda = avgAway;
  } else {
    // Fallback: use overall weighted average
    lambda = weightedSum / weightTotal;
  }

  // Step 4: Estimate dispersion parameter k from full sample variance
  // Using unweighted sample for variance (more stable)
  let sampleMean = 0;
  let sampleVariance = 0;

  if (minutesPlayed) {
    // Use normalized counts
    sampleMean = normalizedCounts.reduce((a, b) => a + b, 0) / n;
    sampleVariance =
      normalizedCounts.reduce(
        (sum, val) => sum + Math.pow(val - sampleMean, 2),
        0
      ) /
      (n - 1);
  } else {
    sampleMean = pastCounts.reduce((a, b) => a + b, 0) / n;
    sampleVariance =
      pastCounts.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) /
      (n - 1);
  }

  // Negative Binomial: variance = mean + (mean² / k)
  // → k = mean² / (variance - mean)
  const excessVariance = sampleVariance - sampleMean;
  let k = excessVariance > 0 ? Math.pow(sampleMean, 2) / excessVariance : 1000; // high k → almost Poisson

  // Safety caps
  k = Math.max(0.1, Math.min(k, 50)); // reasonable range for football stats

  // Step 5: Calculate P(X >= targetCount) using Negative Binomial (NB(r, p) form where r = k, p = k/(k+lambda))
  const p = k / (k + lambda); // success probability
  const r = k; // number of successes until we stop

  // We need survival function: P(X >= targetCount) = 1 - P(X <= targetCount-1)
  let cumProb = 0;
  for (let x = 0; x < targetCount; x++) {
    // Negative Binomial PMF: P(X=x) = C(x+r-1, x) * p^r * (1-p)^x
    cumProb +=
      binomialCoefficient(x + r - 1, x) * Math.pow(p, r) * Math.pow(1 - p, x);
  }

  const probabilityAtLeast = 1 - cumProb;

  // Calculate decimal odds: odds = 1 / probability
  // If probability is 0, set odds to a very high number (e.g., 1000)
  const decimalOdds = probabilityAtLeast > 0 ? 1 / probabilityAtLeast : 1000;

  return {
    probabilityAtLeast: Math.round(probabilityAtLeast * 1000) / 10 + "%", // e.g. 43.7%
    rawProbability: probabilityAtLeast,
    decimalOdds: Number(decimalOdds.toFixed(2)),
    mean: Number(lambda.toFixed(2)),
    variance: Number(sampleVariance.toFixed(2)),
    dispersionK: Number(k.toFixed(2)),
    effectiveLambda: Number(lambda.toFixed(2)),
    model: "Binômio Neg. (por mando e histórico)",
  };
}

/**
 * Calculates probability for a player tip using weekly stats data
 * @param {Object} options
 * @param {Array} options.weeklyData - Array of weekly stats with { total, is_home, min, is_starter }
 * @param {boolean} options.nextIsHome - Whether the next match is at home
 * @param {number} options.targetCount - Target stat count (e.g., threshold or average)
 * @param {boolean} options.useMinutesNormalization - Whether to normalize by minutes played
 * @returns {Object|null} Probability result or null if insufficient data
 */
export function calculatePlayerTipProbability({
  weeklyData,
  nextIsHome,
  targetCount,
  useMinutesNormalization = true,
}) {
  if (!weeklyData || weeklyData.length < 4) {
    return null;
  }

  try {
    // Extract data in reverse order (most recent last)
    // The API returns data in chronological order (oldest first), so we reverse to put most recent last
    const pastCounts = weeklyData.map((item) => item.total ?? 0).reverse();
    const venues = weeklyData
      .map((item) =>
        item.is_home === true || item.is_home === 1 ? "home" : "away"
      )
      .reverse();
    const minutesPlayed =
      useMinutesNormalization &&
      weeklyData[0]?.min !== undefined &&
      weeklyData[0]?.min !== null
        ? weeklyData.map((item) => item.min ?? 90).reverse() // Default to 90 if minutes not available
        : null;

    const nextVenue = nextIsHome ? "home" : "away";

    return calculateNegativeBinomialPlayerProp({
      pastCounts,
      venues,
      nextVenue,
      targetCount,
      minutesPlayed,
      weightHalfLife: 6,
    });
  } catch (error) {
    console.error("Error calculating probability:", error);
    return null;
  }
}
