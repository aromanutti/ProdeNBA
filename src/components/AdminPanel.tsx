import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = import.meta.env.PUBLIC_ADMIN_EMAIL;

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setUser(currentUser);
    setIsAdmin(true);

    const { data } = await supabase.from('series').select('*').order('sort_order');
    setSeries(data || []);
    setLoading(false);
  };

  const changeStatus = async (seriesId: string, newStatus: string) => {
    if (newStatus === 'finished') {
      alert('Para marcar la serie como finalizada con un ganador, por favor haz click en el trofeo (🏆) del equipo ganador en la lista de abajo.');
      return;
    }

    const { data, error } = await supabase
      .from('series')
      .update({ status: newStatus })
      .eq('id', seriesId)
      .select();
    
    if (error) {
      setMessage('Error: ' + error.message);
    } else if (!data || data.length === 0) {
      setMessage('Error de permisos. La base de datos (RLS) bloqueó la actualización.');
    } else {
      setMessage('Status actualizado');
      loadData();
    }
  };

  const setResult = async (seriesId: string, winner: string, games: number) => {
    const { data, error } = await supabase
      .from('series')
      .update({ actual_winner: winner, actual_games: games, status: 'finished' })
      .eq('id', seriesId)
      .select();
    
    if (error) {
      setMessage('Error: ' + error.message);
    } else if (!data || data.length === 0) {
      setMessage('Error de permisos. La base de datos (RLS) bloqueó la actualización.');
    } else {
      setMessage('Resultado guardado');
      loadData();
    }
  };

  const syncFromESPN = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3');
      const data = await res.json();
      setMessage(`Datos de ESPN cargados: ${data.events?.length || 0} partidos encontrados. Usa los controles manuales para actualizar cada serie.`);
    } catch (err) {
      setMessage('Error conectando con ESPN API');
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: '3rem' }}>🔒</span>
        <h2 className="headline-md">Acceso Restringido</h2>
        <p className="body-md text-muted">Solo el administrador puede acceder a esta página.</p>
        <a href="/" className="btn btn--primary">Volver al Inicio</a>
      </div>
    );
  }

  const statusOptions = ['open', 'active', 'finished'];

  return (
    <>
      <div className="hero" style={{ paddingBottom: '16px' }}>
        <h1 className="hero__title" style={{ fontSize: '2rem' }}>Panel Admin</h1>
        <p className="hero__subtitle" style={{ fontSize: '0.9rem' }}>
          Gestionar series y resultados
        </p>
      </div>

      <div className="section">
        <button 
          className="btn btn--secondary" 
          onClick={syncFromESPN}
          disabled={syncing}
          style={{ marginBottom: '16px' }}
        >
          {syncing ? 'Sincronizando...' : '🔄 Consultar ESPN API'}
        </button>

        {message && (
          <div className="card mb-lg" style={{ 
            background: 'rgba(148, 254, 182, 0.08)', 
            color: 'var(--tertiary)',
            fontSize: '0.85rem'
          }}>
            {message}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">⚙️</span>
          Series
        </h2>

        {series.map(s => (
          <div key={s.id} className="admin-grid" style={{ marginBottom: '12px' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                {s.team_home} vs {s.team_away}
              </div>
              <div className="label-sm text-muted" style={{ marginTop: '4px' }}>
                {s.conference?.toUpperCase()} • {s.round}
              </div>
              {s.actual_winner && (
                <div style={{ color: 'var(--tertiary)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Resultado: {s.actual_winner} en {s.actual_games}
                </div>
              )}
            </div>

            <select
              className="form-input"
              style={{ width: '130px' }}
              value={s.status}
              onChange={(e) => changeStatus(s.id, e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn--ghost btn--sm"
                title={`${s.team_home} gana`}
                onClick={() => {
                  const isPlayIn = s.round === 'play_in';
                  if (isPlayIn) {
                    if (confirm(`¿Confirmar que ${s.team_home} ganó el partido?`)) {
                      setResult(s.id, s.team_home, 1);
                    }
                  } else {
                    const gamesStr = prompt(`¿En cuántos juegos ganó ${s.team_home}? (4-7)`);
                    if (gamesStr) setResult(s.id, s.team_home, parseInt(gamesStr));
                  }
                }}
              >
                🏆 {s.team_home}
              </button>
              <button
                className="btn btn--ghost btn--sm"
                title={`${s.team_away} gana`}
                onClick={() => {
                  const isPlayIn = s.round === 'play_in';
                  if (isPlayIn) {
                    if (confirm(`¿Confirmar que ${s.team_away} ganó el partido?`)) {
                      setResult(s.id, s.team_away, 1);
                    }
                  } else {
                    const gamesStr = prompt(`¿En cuántos juegos ganó ${s.team_away}? (4-7)`);
                    if (gamesStr) setResult(s.id, s.team_away, parseInt(gamesStr));
                  }
                }}
              >
                🏆 {s.team_away}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
