import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Series {
  id: string;
  round: string;
  team_home: string;
  team_away: string;
  team_home_full: string;
  team_away_full: string;
  team_home_logo: string;
  team_away_logo: string;
  status: string;
}

interface PredictionFormProps {
  series: Series;
  existingPrediction?: {
    id: string;
    predicted_winner: string;
    predicted_games: number | null;
  } | null;
  userId: string;
  onSaved: () => void;
}

export default function PredictionForm({ series, existingPrediction, userId, onSaved }: PredictionFormProps) {
  const isPlayIn = series.round === 'play_in';
  const [winner, setWinner] = useState(existingPrediction?.predicted_winner || '');
  const [games, setGames] = useState(existingPrediction?.predicted_games || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLocked = series.status !== 'open';
  const isPending = series.status === 'pending';

  const handleSave = async () => {
    if (!winner) {
      setError('Elegí un ganador');
      return;
    }
    if (!isPlayIn && !games) {
      setError('Elegí la cantidad de juegos');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const predictionData: any = {
        predicted_winner: winner,
        predicted_games: isPlayIn ? 1 : games,
      };

      if (existingPrediction) {
        const { error: updateError } = await supabase
          .from('predictions')
          .update({ ...predictionData, updated_at: new Date().toISOString() })
          .eq('id', existingPrediction.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('predictions')
          .insert({
            user_id: userId,
            series_id: series.id,
            ...predictionData,
          });
        if (insertError) throw insertError;
      }
      setSuccess('¡Predicción guardada!');
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error guardando predicción');
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="prediction-selector" style={{ opacity: 0.5 }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <span style={{ fontSize: '2rem' }}>🔒</span>
          <p className="body-md text-muted" style={{ marginTop: '8px' }}>
            Esperando que se definan los equipos del Play-In
          </p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="prediction-selector" style={{ opacity: 0.6 }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <span style={{ fontSize: '1.5rem' }}>🔒</span>
          <p className="body-md text-muted" style={{ marginTop: '8px' }}>
            Las predicciones están cerradas para esta serie
          </p>
          {existingPrediction && (
            <div className="my-prediction-tag" style={{ marginTop: '12px', display: 'inline-flex' }}>
              Tu predicción: {existingPrediction.predicted_winner}
              {existingPrediction.predicted_games && existingPrediction.predicted_games > 1
                ? ` en ${existingPrediction.predicted_games}`
                : ''}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-selector">
      <p className="label-md text-muted" style={{ marginBottom: '16px', textAlign: 'center' }}>
        Elegí al ganador
      </p>

      <div className="prediction-selector__teams">
        <button
          className={`prediction-selector__team-btn ${winner === series.team_home ? 'prediction-selector__team-btn--selected' : ''}`}
          onClick={() => setWinner(series.team_home)}
        >
          {series.team_home_logo ? (
            <img src={series.team_home_logo} alt={series.team_home} />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>?</span>
          )}
          <span>{series.team_home}</span>
        </button>
        <button
          className={`prediction-selector__team-btn ${winner === series.team_away ? 'prediction-selector__team-btn--selected' : ''}`}
          onClick={() => setWinner(series.team_away)}
        >
          {series.team_away_logo ? (
            <img src={series.team_away_logo} alt={series.team_away} />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>?</span>
          )}
          <span>{series.team_away}</span>
        </button>
      </div>

      {/* Games selector — only for playoff series, not Play-In */}
      {!isPlayIn && (
        <>
          <p className="label-md text-muted" style={{ marginBottom: '12px', textAlign: 'center' }}>
            ¿En cuántos juegos?
          </p>
          <div className="prediction-selector__games">
            {[4, 5, 6, 7].map(n => (
              <button
                key={n}
                className={`prediction-selector__game-btn ${games === n ? 'prediction-selector__game-btn--selected' : ''}`}
                onClick={() => setGames(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {isPlayIn && (
        <p className="label-sm text-muted" style={{ textAlign: 'center', marginTop: '8px' }}>
          ⚡ Partido único — 1 punto por acertar ganador
        </p>
      )}

      {error && <div className="auth-error" style={{ marginTop: '16px' }}>{error}</div>}
      {success && (
        <div style={{
          background: 'rgba(148, 254, 182, 0.1)',
          color: 'var(--tertiary)',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginTop: '16px',
          textAlign: 'center'
        }}>
          {success}
        </div>
      )}

      <button
        className="btn btn--primary"
        style={{ width: '100%', marginTop: '20px' }}
        onClick={handleSave}
        disabled={saving || !winner || (!isPlayIn && !games)}
      >
        {saving ? 'Guardando...' : existingPrediction ? 'Actualizar Predicción' : 'Guardar Predicción'}
      </button>
    </div>
  );
}
