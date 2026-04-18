interface Prediction {
  user_id: string;
  predicted_winner: string;
  predicted_games: number;
  profiles: {
    display_name: string;
  } | null;
}

interface GroupPredictionsProps {
  predictions: Prediction[];
  actualWinner?: string | null;
  actualGames?: number | null;
  isFinished?: boolean;
}

export default function GroupPredictions({ predictions, actualWinner, actualGames, isFinished }: GroupPredictionsProps) {
  if (predictions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
        <p className="body-md text-muted">Nadie hizo predicciones para esta serie todavía.</p>
      </div>
    );
  }

  return (
    <div>
      {predictions.map((pred) => {
        let resultClass = 'group-pred__result--pending';
        let resultText = '—';
        
        if (isFinished && actualWinner) {
          const correctWinner = pred.predicted_winner === actualWinner;
          const exactGames = pred.predicted_games === actualGames;
          
          if (correctWinner && exactGames) {
            resultClass = 'group-pred__result--correct';
            resultText = '+3 pts';
          } else if (correctWinner) {
            resultClass = 'group-pred__result--correct';
            resultText = '+1 pt';
          } else {
            resultClass = 'group-pred__result--wrong';
            resultText = '0 pts';
          }
        }

        const displayName = pred.profiles?.display_name ?? 'Usuario';
        return (
          <div key={pred.user_id} className="group-pred">
            <div className="group-pred__avatar">
              {displayName[0]?.toUpperCase() || '?'}
            </div>
            <div className="group-pred__info">
              <div className="group-pred__name">{displayName}</div>
              <div className="group-pred__pick">
                {pred.predicted_winner} en {pred.predicted_games}
              </div>
            </div>
            <span className={`group-pred__result ${resultClass}`}>
              {resultText}
            </span>
          </div>
        );
      })}
    </div>
  );
}
