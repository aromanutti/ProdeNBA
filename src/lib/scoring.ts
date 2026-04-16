export interface Series {
  id: string;
  round: string;
  team_home: string;
  team_away: string;
  actual_winner: string | null;
  actual_games: number | null;
  status: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  series_id: string;
  predicted_winner: string;
  predicted_games: number;
}

export interface UserScore {
  user_id: string;
  display_name: string;
  total_points: number;
  correct_winners: number;
  exact_games: number;
  total_predictions: number;
}

/**
 * Scoring system:
 * - 1 point for correct series winner (any round)
 * - +2 extra points for exact number of games
 */
// Normalize team abbreviations to handle discrepancies (e.g. ESPN 'GS' vs Standard 'GSW')
const normalizeTeam = (abbr: string | null) => {
  if (!abbr) return '';
  const map: Record<string, string> = {
    'GS': 'GSW',
    'SA': 'SAS',
    'NY': 'NYK',
    'NO': 'NOP',
    'UTAH': 'UTA',
    'PHO': 'PHX'
  };
  return map[abbr.toUpperCase()] || abbr.toUpperCase();
};

export function calculatePoints(prediction: Prediction, series: Series): number {
  if (series.status !== 'finished' || !series.actual_winner || !series.actual_games) {
    return 0;
  }

  let points = 0;
  const predWinner = normalizeTeam(prediction.predicted_winner);
  const actWinner = normalizeTeam(series.actual_winner);

  // 1 point for correct winner
  if (predWinner === actWinner) {
    points += 1;

    // +2 extra for exact games
    if (prediction.predicted_games === series.actual_games) {
      points += 2;
    }
  }

  return points;
}

export function calculateLeaderboard(
  predictions: Prediction[],
  series: Series[],
  profiles: { id: string; display_name: string }[]
): UserScore[] {
  const seriesMap = new Map(series.map(s => [s.id, s]));
  const scoreMap = new Map<string, UserScore>();

  // Initialize all users
  for (const profile of profiles) {
    scoreMap.set(profile.id, {
      user_id: profile.id,
      display_name: profile.display_name,
      total_points: 0,
      correct_winners: 0,
      exact_games: 0,
      total_predictions: 0,
    });
  }

  // Calculate scores
  for (const pred of predictions) {
    const s = seriesMap.get(pred.series_id);
    if (!s) continue;

    const score = scoreMap.get(pred.user_id);
    if (!score) continue;

    score.total_predictions++;

    if (s.status === 'finished' && s.actual_winner) {
      const points = calculatePoints(pred, s);
      score.total_points += points;

      if (normalizeTeam(pred.predicted_winner) === normalizeTeam(s.actual_winner)) {
        score.correct_winners++;
        if (pred.predicted_games === s.actual_games) {
          score.exact_games++;
        }
      }
    }
  }

  return Array.from(scoreMap.values()).sort((a, b) => b.total_points - a.total_points);
}
