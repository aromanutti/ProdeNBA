interface Series {
  id: string;
  round: string;
  conference: string;
  team_home: string;
  team_away: string;
  team_home_seed: number;
  team_away_seed: number;
  team_home_full: string;
  team_away_full: string;
  team_home_logo: string;
  team_away_logo: string;
  team_home_color: string;
  team_away_color: string;
  status: string;
  actual_winner: string | null;
  actual_games: number | null;
}

interface Prediction {
  predicted_winner: string;
  predicted_games: number | null;
}

interface SeriesCardProps {
  series: Series;
  prediction?: Prediction | null;
  onClick?: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  open: 'Abierta',
  active: 'En Juego',
  finished: 'Finalizada',
};

const roundLabels: Record<string, string> = {
  play_in: 'Play-In',
  first_round: 'Primera Ronda',
  conf_semis: 'Semifinales Conf.',
  conf_finals: 'Finales Conf.',
  finals: 'Finales NBA',
};

export default function SeriesCard({ series, prediction, onClick }: SeriesCardProps) {
  const isPending = series.status === 'pending';
  const isPlayIn = series.round === 'play_in';
  const hasTBD = series.team_home === 'TBD' || series.team_away === 'TBD';

  return (
    <div
      className={`series-card ${isPending ? 'series-card--pending' : ''}`}
      onClick={isPending ? undefined : onClick}
      style={{ cursor: isPending ? 'default' : onClick ? 'pointer' : 'default' }}
    >
      <div className="series-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`conf-label conf-label--${series.conference}`}>
            {series.conference === 'east' ? 'Este' : 'Oeste'}
          </span>
          <span className="series-card__round">{roundLabels[series.round] || series.round}</span>
          {isPlayIn && (
            <span style={{
              background: 'rgba(255, 107, 0, 0.15)',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              1 Juego
            </span>
          )}
        </div>
        <span className={`series-card__status series-card__status--${series.status}`}>
          {isPending && '🔒 '}{statusLabels[series.status]}
        </span>
      </div>

      <div className="series-card__matchup">
        <div className="series-card__team">
          {series.team_home_logo ? (
            <img
              src={series.team_home_logo}
              alt={series.team_home_full}
              className="series-card__logo"
            />
          ) : (
            <div className="series-card__logo series-card__logo--placeholder">?</div>
          )}
          <span className="series-card__abbr">{series.team_home === 'TBD' ? '?' : series.team_home}</span>
          {series.team_home_seed > 0 && (
            <span className="series-card__seed">#{series.team_home_seed}</span>
          )}
          <span className="series-card__name">{series.team_home_full}</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="series-card__vs">VS</div>
          {series.status === 'finished' && series.actual_winner && (
            <div style={{ marginTop: '8px' }}>
              <span className="label-sm text-muted">Resultado</span>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--tertiary)',
                marginTop: '4px'
              }}>
                {series.actual_winner}{series.actual_games && series.actual_games > 1 ? ` en ${series.actual_games}` : ' gana'}
              </div>
            </div>
          )}
        </div>

        <div className="series-card__team">
          {series.team_away_logo ? (
            <img
              src={series.team_away_logo}
              alt={series.team_away_full}
              className="series-card__logo"
            />
          ) : (
            <div className="series-card__logo series-card__logo--placeholder">?</div>
          )}
          <span className="series-card__abbr">{series.team_away === 'TBD' ? '?' : series.team_away}</span>
          {series.team_away_seed > 0 && (
            <span className="series-card__seed">#{series.team_away_seed}</span>
          )}
          <span className="series-card__name">{series.team_away_full}</span>
        </div>
      </div>

      {isPending && (
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--on-surface-variant)',
        }}>
          🔒 Esperando resultados del Play-In
        </div>
      )}

      {prediction && !isPending && (
        <div className="my-prediction-tag" style={{ marginTop: '16px', justifyContent: 'center', width: '100%' }}>
          Tu predicción: {prediction.predicted_winner}
          {prediction.predicted_games ? ` en ${prediction.predicted_games}` : ''}
        </div>
      )}
    </div>
  );
}
