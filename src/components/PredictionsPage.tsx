import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SeriesCard from './SeriesCard';
import PredictionForm from './PredictionForm';
import GroupPredictions from './GroupPredictions';

export default function PredictionsPage() {
  const [user, setUser] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);

    const [seriesRes, myPredsRes, allPredsRes] = await Promise.all([
      supabase.from('series').select('*').order('sort_order'),
      supabase.from('predictions').select('*').eq('user_id', currentUser.id),
      supabase.from('predictions').select('*, profiles(display_name)'),
    ]);

    setSeries(seriesRes.data || []);
    setPredictions(myPredsRes.data || []);
    setAllPredictions(allPredsRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  const groupByStatus = (status: string) => series.filter(s => s.status === status);
  const myPred = (seriesId: string) => predictions.find(p => p.series_id === seriesId);
  const seriesPreds = (seriesId: string) => allPredictions.filter(p => p.series_id === seriesId);

  return (
    <>
      <div className="hero" style={{ paddingBottom: '16px' }}>
        <h1 className="hero__title" style={{ fontSize: '2rem' }}>Mis Predicciones</h1>
        <p className="hero__subtitle" style={{ fontSize: '0.9rem' }}>
          Elegí el ganador y la cantidad de juegos para cada serie
        </p>
      </div>

      {/* Detail modal */}
      {selectedSeries && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSeries(null); }}
        >
          <div style={{
            background: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="headline-sm">
                {selectedSeries.team_home} vs {selectedSeries.team_away}
              </h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setSelectedSeries(null)}>✕</button>
            </div>

            <SeriesCard series={selectedSeries} prediction={myPred(selectedSeries.id)} />

            <div style={{ marginTop: '24px' }}>
              <PredictionForm
                series={selectedSeries}
                existingPrediction={myPred(selectedSeries.id)}
                userId={user.id}
                onSaved={loadData}
              />
            </div>

            {/* Group predictions (visible when series active or finished) */}
            {(selectedSeries.status === 'active' || selectedSeries.status === 'finished') && (
              <div style={{ marginTop: '24px' }}>
                <h4 className="label-lg text-muted" style={{ marginBottom: '12px' }}>
                  Predicciones del Grupo
                </h4>
                <GroupPredictions
                  predictions={seriesPreds(selectedSeries.id)}
                  actualWinner={selectedSeries.actual_winner}
                  actualGames={selectedSeries.actual_games}
                  isFinished={selectedSeries.status === 'finished'}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open series */}
      {groupByStatus('open').length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">✨</span>
            Abiertas — Hacé tu predicción
          </h2>
          <div className="grid-2">
            {groupByStatus('open').map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPred(s.id)}
                onClick={() => setSelectedSeries(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active series */}
      {groupByStatus('active').length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">🏀</span>
            En Juego — Predicciones cerradas
          </h2>
          <div className="grid-2">
            {groupByStatus('active').map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPred(s.id)}
                onClick={() => setSelectedSeries(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Finished */}
      {groupByStatus('finished').length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">✅</span>
            Finalizadas
          </h2>
          <div className="grid-2">
            {groupByStatus('finished').map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPred(s.id)}
                onClick={() => setSelectedSeries(s)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
