interface UserScore {
  user_id: string;
  display_name: string;
  total_points: number;
  correct_winners: number;
  exact_games: number;
  total_predictions: number;
}

interface LeaderboardTableProps {
  scores: UserScore[];
  currentUserId?: string;
}

export default function LeaderboardTable({ scores, currentUserId }: LeaderboardTableProps) {
  if (scores.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <span style={{ fontSize: '2rem' }}>🏆</span>
        <p className="body-md text-muted" style={{ marginTop: '12px' }}>
          Todavía no hay resultados. Las posiciones se actualizan cuando las series finalizan.
        </p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <span>#</span>
        <span>Jugador</span>
        <span style={{ textAlign: 'center' }}>Pts</span>
        <span style={{ textAlign: 'center' }}>✓</span>
        <span style={{ textAlign: 'center' }}>Exacto</span>
      </div>
      {scores.map((score, i) => (
        <div
          key={score.user_id}
          className="leaderboard__row"
          style={score.user_id === currentUserId ? { background: 'rgba(255, 145, 89, 0.05)' } : {}}
        >
          <span className={`leaderboard__rank ${i < 3 ? `leaderboard__rank--${i + 1}` : ''}`}>
            {i + 1}
          </span>
          <div className="leaderboard__name">
            <div className="leaderboard__name-avatar">
              {score.display_name[0]?.toUpperCase() || '?'}
            </div>
            <span className="leaderboard__name-text">
              {score.display_name}
              {score.user_id === currentUserId && (
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400, fontSize: '0.75rem' }}> (vos)</span>
              )}
            </span>
          </div>
          <span className="leaderboard__stat leaderboard__points">{score.total_points}</span>
          <span className="leaderboard__stat">{score.correct_winners}</span>
          <span className="leaderboard__stat" style={{ color: 'var(--tertiary)' }}>{score.exact_games}</span>
        </div>
      ))}
    </div>
  );
}
