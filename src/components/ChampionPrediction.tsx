import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ChampionPredictionProps {
  championSeries: any;
  allSeries: any[];
  existingPrediction?: any | null;
  allPredictions: any[];
  userId: string;
  onSaved: () => void;
}

export default function ChampionPrediction({
  championSeries,
  allSeries,
  existingPrediction,
  allPredictions,
  userId,
  onSaved,
}: ChampionPredictionProps) {
  const [selectedTeam, setSelectedTeam] = useState(existingPrediction?.predicted_winner || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGroupPreds, setShowGroupPreds] = useState(false);

  // Get unique teams from first_round series
  const firstRoundSeries = allSeries.filter(s => s.round === 'first_round');
  const teamsSet = new Set<string>();
  firstRoundSeries.forEach(s => {
    if (s.team_home && s.team_home !== 'TBD') teamsSet.add(s.team_home);
    if (s.team_away && s.team_away !== 'TBD') teamsSet.add(s.team_away);
  });
  const teams = Array.from(teamsSet).sort();

  // Build team info map for logos/names
  const teamInfoMap: Record<string, { full: string; logo: string; seed: number; conference: string }> = {};
  firstRoundSeries.forEach(s => {
    if (s.team_home && s.team_home !== 'TBD') {
      teamInfoMap[s.team_home] = {
        full: s.team_home_full || s.team_home,
        logo: s.team_home_logo || '',
        seed: s.team_home_seed || 0,
        conference: s.conference || '',
      };
    }
    if (s.team_away && s.team_away !== 'TBD') {
      teamInfoMap[s.team_away] = {
        full: s.team_away_full || s.team_away,
        logo: s.team_away_logo || '',
        seed: s.team_away_seed || 0,
        conference: s.conference || '',
      };
    }
  });

  const isPastStartTime = championSeries.start_time && new Date() >= new Date(championSeries.start_time);
  const isLocked = championSeries.status !== 'open' || isPastStartTime;
  const isFinished = championSeries.status === 'finished';
  const isActive = championSeries.status === 'active';

  // Champion predictions from all users
  const champPreds = allPredictions.filter(p => p.series_id === championSeries.id);

  const handleSave = async () => {
    if (!selectedTeam) {
      setError('Elegí un equipo');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (existingPrediction) {
        const { error: updateError } = await supabase
          .from('predictions')
          .update({
            predicted_winner: selectedTeam,
            predicted_games: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPrediction.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('predictions')
          .insert({
            user_id: userId,
            series_id: championSeries.id,
            predicted_winner: selectedTeam,
            predicted_games: null,
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

  const statusLabel = isFinished ? 'Finalizada' : isActive ? 'En Juego' : isLocked ? 'Cerrada' : 'Abierta';
  const statusClass = isFinished ? 'finished' : isActive ? 'active' : 'open';

  return (
    <div className="champion-card">
      <div className="champion-card__header">
        <div className="champion-card__title-row">
          <span className="champion-card__trophy">🏆</span>
          <div>
            <h3 className="champion-card__title">Campeón Anticipado</h3>
            <p className="champion-card__subtitle">¿Quién será el campeón NBA 2026?</p>
          </div>
        </div>
        <div className="champion-card__badge-row">
          <span className="champion-card__points-badge">+5 pts</span>
          <span className={`series-card__status series-card__status--${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="champion-card__body">
        {/* OPEN — show selector */}
        {!isLocked && (
          <>
            {championSeries.start_time && (
              <div style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--tertiary)',
                marginBottom: '16px',
                background: 'rgba(148, 254, 182, 0.05)',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 254, 182, 0.1)'
              }}>
                ⏳ Tenés tiempo hasta el {new Date(championSeries.start_time).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} a las {new Date(championSeries.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            <p className="label-md text-muted" style={{ marginBottom: '12px', textAlign: 'center' }}>
              Elegí al futuro campeón
            </p>

            <div className="champion-card__select-wrapper">
              <select
                className="form-input champion-card__select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Seleccionar equipo...</option>
                {teams.map(abbr => {
                  const info = teamInfoMap[abbr];
                  return (
                    <option key={abbr} value={abbr}>
                      {info ? `${info.full} (${abbr})` : abbr}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedTeam && teamInfoMap[selectedTeam] && (
              <div className="champion-card__selected-team">
                {teamInfoMap[selectedTeam].logo && (
                  <img
                    src={teamInfoMap[selectedTeam].logo}
                    alt={selectedTeam}
                    className="champion-card__selected-logo"
                  />
                )}
                <div>
                  <div className="champion-card__selected-name">{teamInfoMap[selectedTeam].full}</div>
                  <div className="champion-card__selected-conf">
                    #{teamInfoMap[selectedTeam].seed} • {teamInfoMap[selectedTeam].conference === 'east' ? 'Este' : 'Oeste'}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="auth-error" style={{ marginTop: '12px' }}>{error}</div>}
            {success && (
              <div style={{
                background: 'rgba(148, 254, 182, 0.1)',
                color: 'var(--tertiary)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginTop: '12px',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            <button
              className="btn btn--primary"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleSave}
              disabled={saving || !selectedTeam}
            >
              {saving ? 'Guardando...' : existingPrediction ? 'Actualizar Predicción' : 'Guardar Predicción'}
            </button>
          </>
        )}

        {/* LOCKED (active or finished) — show your pick + group predictions */}
        {isLocked && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <p className="body-md text-muted" style={{ marginTop: '8px' }}>
                Las predicciones están cerradas
              </p>
              {existingPrediction && (
                <div className="champion-card__my-pick" style={{ marginTop: '12px' }}>
                  {teamInfoMap[existingPrediction.predicted_winner]?.logo && (
                    <img
                      src={teamInfoMap[existingPrediction.predicted_winner].logo}
                      alt={existingPrediction.predicted_winner}
                      style={{ width: '32px', height: '32px' }}
                    />
                  )}
                  <span>
                    Tu predicción: <strong>{teamInfoMap[existingPrediction.predicted_winner]?.full || existingPrediction.predicted_winner}</strong>
                  </span>
                  {isFinished && championSeries.actual_winner && (
                    <span className={
                      existingPrediction.predicted_winner?.toUpperCase() === championSeries.actual_winner?.toUpperCase()
                        ? 'champion-card__result--correct'
                        : 'champion-card__result--wrong'
                    }>
                      {existingPrediction.predicted_winner?.toUpperCase() === championSeries.actual_winner?.toUpperCase()
                        ? '+5 pts ✅'
                        : '0 pts ❌'}
                    </span>
                  )}
                </div>
              )}
              {!existingPrediction && (
                <div className="my-prediction-tag" style={{ marginTop: '12px', opacity: 0.6 }}>
                  No hiciste predicción
                </div>
              )}
            </div>

            {/* Finished: show actual winner */}
            {isFinished && championSeries.actual_winner && (
              <div className="champion-card__actual-winner">
                {teamInfoMap[championSeries.actual_winner]?.logo && (
                  <img
                    src={teamInfoMap[championSeries.actual_winner].logo}
                    alt={championSeries.actual_winner}
                    style={{ width: '40px', height: '40px' }}
                  />
                )}
                <div>
                  <div className="label-sm text-muted">Campeón NBA 2026</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--tertiary)' }}>
                    {teamInfoMap[championSeries.actual_winner]?.full || championSeries.actual_winner}
                  </div>
                </div>
              </div>
            )}

            {/* Group predictions toggle */}
            {(isActive || isFinished) && champPreds.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <button
                  className="btn btn--ghost btn--sm"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                  onClick={() => setShowGroupPreds(!showGroupPreds)}
                >
                  {showGroupPreds ? '▲ Ocultar predicciones del grupo' : '▼ Ver predicciones del grupo'}
                </button>

                {showGroupPreds && (
                  <div style={{ marginTop: '12px' }}>
                    {champPreds.map((pred: any) => {
                      const displayName = pred.profiles?.display_name ?? 'Usuario';
                      const teamInfo = teamInfoMap[pred.predicted_winner];
                      let resultClass = 'group-pred__result--pending';
                      let resultText = '—';

                      if (isFinished && championSeries.actual_winner) {
                        const correct = pred.predicted_winner?.toUpperCase() === championSeries.actual_winner?.toUpperCase();
                        if (correct) {
                          resultClass = 'group-pred__result--correct';
                          resultText = '+5 pts';
                        } else {
                          resultClass = 'group-pred__result--wrong';
                          resultText = '0 pts';
                        }
                      }

                      return (
                        <div key={pred.user_id} className="group-pred">
                          <div className="group-pred__avatar">
                            {displayName[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="group-pred__info">
                            <div className="group-pred__name">{displayName}</div>
                            <div className="group-pred__pick" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {teamInfo?.logo && (
                                <img src={teamInfo.logo} alt={pred.predicted_winner} style={{ width: '16px', height: '16px' }} />
                              )}
                              {teamInfo?.full || pred.predicted_winner}
                            </div>
                          </div>
                          <span className={`group-pred__result ${resultClass}`}>
                            {resultText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
