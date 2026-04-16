import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateLeaderboard } from '../lib/scoring';
import SeriesCard from './SeriesCard';
import LeaderboardTable from './LeaderboardTable';

import Bracket from './Bracket';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    const [seriesRes, predsRes, profilesRes] = await Promise.all([
      supabase.from('series').select('*').order('sort_order'),
      supabase.from('predictions').select('*'),
      supabase.from('profiles').select('*'),
    ]);

    const now = new Date();
    const processedSeries = (seriesRes.data || []).map(s => {
      if (s.status === 'open' && s.start_time && now >= new Date(s.start_time)) {
        return { ...s, status: 'active' };
      }
      return s;
    });

    setSeries(processedSeries);
    setPredictions(predsRes.data || []);
    setProfiles(profilesRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const leaderboard = calculateLeaderboard(predictions, series, profiles);
  const myPredictions = predictions.filter(p => p.user_id === user?.id);

  const playInSeries = series.filter(s => s.round === 'play_in');
  const playoffSeries = series.filter(s => s.round !== 'play_in');

  const openPlayIns = playInSeries.filter(s => s.status === 'open');
  const pendingPlayIns = playInSeries.filter(s => s.status === 'pending');
  const activePlayIns = playInSeries.filter(s => s.status === 'active');
  const finishedPlayIns = playInSeries.filter(s => s.status === 'finished');

  const openPlayoffs = playoffSeries.filter(s => s.status === 'open');
  const pendingPlayoffs = playoffSeries.filter(s => s.status === 'pending');
  const activePlayoffs = playoffSeries.filter(s => s.status === 'active');

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <h1 className="hero__title">Playoffs 2026</h1>
        <p className="hero__subtitle">
          {user ? `¡Bienvenido, ${user.user_metadata?.display_name || user.email?.split('@')[0]}!` : 'Predecí las series con tus amigos'}
        </p>
        {!user && (
          <a href="/login" className="btn btn--primary" style={{ marginTop: '24px' }}>
            Empezar a Jugar
          </a>
        )}
      </div>

      <div className="section" style={{ overflow: 'hidden' }}>
        <h2 className="section-title">
          <span className="section-title__icon">🌲</span>
          Bracket Oficial
        </h2>
        <Bracket series={series} />
      </div>

      {/* Quick leaderboard */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">🏆</span>
          Tabla de Posiciones
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <LeaderboardTable scores={leaderboard.slice(0, 5)} currentUserId={user?.id} />
        </div>
        {leaderboard.length > 5 && (
          <div className="text-center mt-md">
            <a href="/posiciones" className="btn btn--ghost">Ver tabla completa →</a>
          </div>
        )}
      </div>

      {/* Play-In Tournament */}
      {playInSeries.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">⚡</span>
            Play-In Tournament
          </h2>
          <p className="body-sm text-muted" style={{ marginBottom: '16px', marginTop: '-8px' }}>
            Los ganadores definen los seeds #7 y #8 de cada conferencia
          </p>

          {/* Open Play-In */}
          {openPlayIns.length > 0 && (
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              {openPlayIns.map(s => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  prediction={myPredictions.find(p => p.series_id === s.id)}
                  onClick={() => window.location.href = '/predicciones'}
                />
              ))}
            </div>
          )}

          {/* Active Play-In */}
          {activePlayIns.length > 0 && (
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              {activePlayIns.map(s => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  prediction={myPredictions.find(p => p.series_id === s.id)}
                  onClick={() => window.location.href = '/predicciones'}
                />
              ))}
            </div>
          )}

          {/* Finished Play-In */}
          {finishedPlayIns.length > 0 && (
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              {finishedPlayIns.map(s => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  prediction={myPredictions.find(p => p.series_id === s.id)}
                  onClick={() => window.location.href = '/predicciones'}
                />
              ))}
            </div>
          )}

          {/* Pending Play-In */}
          {pendingPlayIns.length > 0 && (
            <div className="grid-2">
              {pendingPlayIns.map(s => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active playoff series */}
      {activePlayoffs.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">🏀</span>
            Series Activas
          </h2>
          <div className="grid-2">
            {activePlayoffs.map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPredictions.find(p => p.series_id === s.id)}
                onClick={() => window.location.href = '/predicciones'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Open playoff series */}
      {openPlayoffs.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">✨</span>
            Primera Ronda — Abiertas para Predicciones
          </h2>
          <div className="grid-2">
            {openPlayoffs.map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPredictions.find(p => p.series_id === s.id)}
                onClick={() => window.location.href = '/predicciones'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending playoff series */}
      {pendingPlayoffs.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">🔒</span>
            Esperando Play-In
          </h2>
          <div className="grid-2">
            {pendingPlayoffs.map(s => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      )}

      {/* Finished series */}
      {playoffSeries.filter(s => s.status === 'finished').length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <span className="section-title__icon">✅</span>
            Series Finalizadas
          </h2>
          <div className="grid-2">
            {playoffSeries.filter(s => s.status === 'finished').map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                prediction={myPredictions.find(p => p.series_id === s.id)}
                onClick={() => window.location.href = '/predicciones'}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
