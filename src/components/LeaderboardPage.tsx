import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateLeaderboard } from '../lib/scoring';
import LeaderboardTable from './LeaderboardTable';

export default function LeaderboardPage() {
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    const [seriesRes, predsRes, profilesRes] = await Promise.all([
      supabase.from('series').select('*'),
      supabase.from('predictions').select('*'),
      supabase.from('profiles').select('*'),
    ]);

    const leaderboard = calculateLeaderboard(
      predsRes.data || [],
      seriesRes.data || [],
      profilesRes.data || []
    );
    setScores(leaderboard);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: '16px' }}>
        <h1 className="hero__title" style={{ fontSize: '2rem' }}>Tabla de Posiciones</h1>
        <p className="hero__subtitle" style={{ fontSize: '0.9rem' }}>
          Clasificación general del prode
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <LeaderboardTable scores={scores} currentUserId={user?.id} />
      </div>

      <div className="card mt-lg" style={{ textAlign: 'center' }}>
        <p className="body-md text-muted">
          📊 <strong>Sistema de puntaje:</strong> 1 punto por acertar el ganador • +2 puntos extra por acertar la cantidad exacta de juegos • 🏆 5 puntos por acertar el Campeón Anticipado
        </p>
      </div>
    </>
  );
}
