import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import Bracket from './Bracket';

const ADMIN_EMAIL = import.meta.env.PUBLIC_ADMIN_EMAIL;

const NBA_TEAMS = [
  { abbr: 'TBD', name: 'A Definir', espnUrl: '' },
  { abbr: 'ATL', name: 'Atlanta Hawks', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/atl.png' },
  { abbr: 'BOS', name: 'Boston Celtics', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png' },
  { abbr: 'BKN', name: 'Brooklyn Nets', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bkn.png' },
  { abbr: 'CHA', name: 'Charlotte Hornets', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cha.png' },
  { abbr: 'CHI', name: 'Chicago Bulls', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/chi.png' },
  { abbr: 'CLE', name: 'Cleveland Cavaliers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cle.png' },
  { abbr: 'DAL', name: 'Dallas Mavericks', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/dal.png' },
  { abbr: 'DEN', name: 'Denver Nuggets', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/den.png' },
  { abbr: 'DET', name: 'Detroit Pistons', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/det.png' },
  { abbr: 'GSW', name: 'Golden State Warriors', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gs.png' },
  { abbr: 'HOU', name: 'Houston Rockets', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/hou.png' },
  { abbr: 'IND', name: 'Indiana Pacers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/ind.png' },
  { abbr: 'LAC', name: 'LA Clippers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lac.png' },
  { abbr: 'LAL', name: 'Los Angeles Lakers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png' },
  { abbr: 'MEM', name: 'Memphis Grizzlies', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mem.png' },
  { abbr: 'MIA', name: 'Miami Heat', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png' },
  { abbr: 'MIL', name: 'Milwaukee Bucks', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mil.png' },
  { abbr: 'MIN', name: 'Minnesota Timberwolves', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/min.png' },
  { abbr: 'NOP', name: 'New Orleans Pelicans', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/no.png' },
  { abbr: 'NYK', name: 'New York Knicks', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/ny.png' },
  { abbr: 'OKC', name: 'Oklahoma City Thunder', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/okc.png' },
  { abbr: 'ORL', name: 'Orlando Magic', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/orl.png' },
  { abbr: 'PHI', name: 'Philadelphia 76ers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/phi.png' },
  { abbr: 'PHX', name: 'Phoenix Suns', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/phx.png' },
  { abbr: 'POR', name: 'Portland Trail Blazers', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/por.png' },
  { abbr: 'SAC', name: 'Sacramento Kings', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sac.png' },
  { abbr: 'SAS', name: 'San Antonio Spurs', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sa.png' },
  { abbr: 'TOR', name: 'Toronto Raptors', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/tor.png' },
  { abbr: 'UTA', name: 'Utah Jazz', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/utah.png' },
  { abbr: 'WAS', name: 'Washington Wizards', espnUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/was.png' }
];

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [editDates, setEditDates] = useState<Record<string, string>>({});

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
    const now = new Date();
    const processedSeries = (data || []).map(s => {
      if (s.status === 'open' && s.start_time && now >= new Date(s.start_time)) {
        return { ...s, status: 'active' };
      }
      return s;
    });
    setSeries(processedSeries);
    setLoading(false);
  };

  const updateTeam = async (seriesId: string, type: 'home' | 'away', abbr: string) => {
    const team = NBA_TEAMS.find(t => t.abbr === abbr) || NBA_TEAMS[0];
    const updatePayload = type === 'home' 
      ? { team_home: team.abbr, team_home_full: team.name, team_home_logo: team.espnUrl }
      : { team_away: team.abbr, team_away_full: team.name, team_away_logo: team.espnUrl };

    const { error } = await supabase.from('series').update(updatePayload).eq('id', seriesId);
    if (error) setMessage('Error al actualizar equipo: ' + error.message);
    else {
      setMessage('Equipo actualizado exitosamente');
      loadData();
    }
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

  const changeStartTime = async (seriesId: string, newStartTime: string) => {
    const { data, error } = await supabase
      .from('series')
      .update({ start_time: newStartTime || null })
      .eq('id', seriesId)
      .select();
    
    if (error) {
      setMessage('Error guardando fecha: ' + error.message);
    } else if (!data || data.length === 0) {
      setMessage('Error de permisos. La base de datos (RLS) bloqueó la actualización.');
    } else {
      setMessage('Hora de inicio actualizada');
      loadData();
    }
  };

  const routeTeam = async (targetSortOrder: number, teamSlot: 'home' | 'away', teamAbbr: string) => {
    const target = series.find(s => s.sort_order === targetSortOrder);
    if (!target) return;
    const teamFull = NBA_TEAMS.find(t => t.abbr === teamAbbr) || NBA_TEAMS[0];
    const update = teamSlot === 'home' 
      ? { team_home: teamAbbr, team_home_full: teamFull.name, team_home_logo: teamFull.espnUrl }
      : { team_away: teamAbbr, team_away_full: teamFull.name, team_away_logo: teamFull.espnUrl };
    await supabase.from('series').update(update).eq('id', target.id);
  };

  const advanceBracket = async (s: any, winner: string) => {
    if (!s) return;
    const loser = winner === s.team_home ? s.team_away : s.team_home;
    
    // Play-In East
    if (s.sort_order === 1) { 
       await routeTeam(8, 'away', winner); 
       await routeTeam(5, 'home', loser);  
    }
    else if (s.sort_order === 3) await routeTeam(5, 'away', winner);
    else if (s.sort_order === 5) await routeTeam(7, 'away', winner); 

    // Play-In West
    else if (s.sort_order === 2) { 
       await routeTeam(12, 'away', winner); 
       await routeTeam(6, 'home', loser); 
    }
    else if (s.sort_order === 4) await routeTeam(6, 'away', winner);
    else if (s.sort_order === 6) await routeTeam(11, 'away', winner);

    // East Round 1 -> Semis
    else if (s.sort_order === 7) await routeTeam(15, 'home', winner);
    else if (s.sort_order === 10) await routeTeam(15, 'away', winner);
    else if (s.sort_order === 8) await routeTeam(16, 'home', winner);
    else if (s.sort_order === 9) await routeTeam(16, 'away', winner);

    // West Round 1 -> Semis
    else if (s.sort_order === 11) await routeTeam(17, 'home', winner);
    else if (s.sort_order === 14) await routeTeam(17, 'away', winner);
    else if (s.sort_order === 12) await routeTeam(18, 'home', winner);
    else if (s.sort_order === 13) await routeTeam(18, 'away', winner);

    // Semis -> Conf Finals
    else if (s.sort_order === 15) await routeTeam(19, 'home', winner);
    else if (s.sort_order === 16) await routeTeam(19, 'away', winner);
    else if (s.sort_order === 17) await routeTeam(20, 'home', winner);
    else if (s.sort_order === 18) await routeTeam(20, 'away', winner);

    // Conf Finals -> NBA Finals
    else if (s.sort_order === 19) await routeTeam(21, 'home', winner);
    else if (s.sort_order === 20) await routeTeam(21, 'away', winner);
  };

  const setResult = async (seriesId: string, winner: string, games: number) => {
    const currentSeries = series.find(s => s.id === seriesId);
    let finalMvp = null;
    if (currentSeries && (currentSeries.round === 'conf_finals' || currentSeries.round === 'finals')) {
      finalMvp = prompt(`¿Quién fue el MVP de esta final? (Dejar en blanco si no se conoce)`);
    }

    const payload: any = { actual_winner: winner, actual_games: games, status: 'finished' };
    if (finalMvp) payload.actual_mvp = finalMvp;

    const { data, error } = await supabase
      .from('series')
      .update(payload)
      .eq('id', seriesId)
      .select();
    
    if (error) {
      setMessage('Error: ' + error.message);
      return;
    } else if (!data || data.length === 0) {
      setMessage('Error de permisos. La base de datos (RLS) bloqueó la actualización.');
      return;
    }

    await advanceBracket(currentSeries, winner);
    setMessage('Resultado guardado y el bracket avanzó correctamente');
    loadData();
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

      <div className="section" style={{ overflow: 'hidden' }}>
        <h2 className="section-title">
          <span className="section-title__icon">📈</span>
          Bracket Interactivo
        </h2>
        <Bracket series={series} isAdmin={true} onSeriesClick={(s) => {
          // Future scroll to series or something. Currently just viewable.
        }}/>
      </div>

      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">⚙️</span>
          Series Manuales
        </h2>

        {series.map(s => (
          <div key={s.id} className="admin-grid" style={{ marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
                <select 
                  className="form-input" 
                  style={{ width: '85px', padding: '4px', fontSize: '0.8rem', fontWeight: 700 }}
                  value={s.team_home}
                  onChange={(e) => updateTeam(s.id, 'home', e.target.value)}
                >
                  {NBA_TEAMS.map(t => <option key={t.abbr} value={t.abbr}>{t.abbr}</option>)}
                </select>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>vs</span>
                <select 
                  className="form-input" 
                  style={{ width: '85px', padding: '4px', fontSize: '0.8rem', fontWeight: 700 }}
                  value={s.team_away}
                  onChange={(e) => updateTeam(s.id, 'away', e.target.value)}
                >
                  {NBA_TEAMS.map(t => <option key={t.abbr} value={t.abbr}>{t.abbr}</option>)}
                </select>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

              <div>
                <label className="label-sm text-muted" style={{ display: 'block', fontSize: '0.65rem', marginBottom: '4px' }}>
                  Cierre de Predicciones
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {(() => {
                    const getLocalDt = (isoUrl: string) => {
                      if (!isoUrl) return '';
                      const d = new Date(isoUrl);
                      if (isNaN(d.getTime())) return '';
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    };

                    const currentVal = editDates[s.id] !== undefined ? editDates[s.id] : getLocalDt(s.start_time);

                    return (
                      <>
                        <input
                          type="datetime-local"
                          className="form-input"
                          style={{ padding: '4px', fontSize: '0.75rem', flex: 1, maxWidth: '160px' }}
                          value={currentVal}
                          onChange={(e) => setEditDates({ ...editDates, [s.id]: e.target.value })}
                        />
                        {editDates[s.id] !== undefined && editDates[s.id] !== getLocalDt(s.start_time) && (
                          <button 
                            className="btn btn--primary btn--sm"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            onClick={() => {
                              const dt = editDates[s.id];
                              const finalIso = dt ? new Date(dt).toISOString() : '';
                              changeStartTime(s.id, finalIso);
                              
                              const newEdits = {...editDates};
                              delete newEdits[s.id];
                              setEditDates(newEdits);
                            }}
                          >
                            Guardar
                          </button>
                        )}
                        {s.start_time && editDates[s.id] === undefined && (
                          <button 
                            className="btn btn--sm" 
                            style={{ padding: '4px', opacity: 0.7, background: 'transparent' }}
                            onClick={() => changeStartTime(s.id, '')}
                            title="Limpiar fecha"
                          >
                            ❌
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

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
