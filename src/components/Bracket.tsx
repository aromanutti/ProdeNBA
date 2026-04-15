import React from 'react';

interface BracketProps {
  series: any[];
  onSeriesClick?: (series: any) => void;
  isAdmin?: boolean;
}

export default function Bracket({ series, onSeriesClick, isAdmin = false }: BracketProps) {
  // Helper to find a specific series by its sort_order or ID if we mapped them cleanly.
  // Wait, let's map by sort_order right now according to the 21 orders.
  // 1: E 7v8, 2: W 7v8, 3: E 9v10, 4: W 9v10, 5: E 8th, 6: W 8th
  // 7: E 1v8, 8: E 2v7, 9: E 3v6, 10: E 4v5
  // 11: W 1v8, 12: W 2v7, 13: W 3v6, 14: W 4v5
  // 15: E Semis 1 (1v8 vs 4v5), 16: E Semis 2 (2v7 vs 3v6)
  // 17: W Semis 1 (1v8 vs 4v5), 18: W Semis 2 (2v7 vs 3v6)
  // 19: E Conf Finals, 20: W Conf Finals, 21: NBA Finals
  
  const getSeries = (order: number) => series.find(s => s.sort_order === order);

  // Groupings
  const playInW = [getSeries(4), getSeries(6), getSeries(2)]; // 9v10, 8th decider, 7v8
  const playInE = [getSeries(3), getSeries(5), getSeries(1)]; 

  const round1W = [getSeries(11), getSeries(14), getSeries(13), getSeries(12)]; // 1v8, 4v5, 3v6, 2v7
  const round1E = [getSeries(7), getSeries(10), getSeries(9), getSeries(8)];
  
  const semisW = [getSeries(17), getSeries(18)];
  const semisE = [getSeries(15), getSeries(16)];

  const finalsW = [getSeries(20)];
  const finalsE = [getSeries(19)];

  const nbaFinals = [getSeries(21)];

  const renderTeam = (teamAbbr: string, teamLogo: string, seed: number, color: string, winnerAbbr?: string) => {
    const isWinner = winnerAbbr && winnerAbbr === teamAbbr;
    const isLoser = winnerAbbr && winnerAbbr !== teamAbbr;
    
    return (
      <div className={`bracket-team ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`} style={{ borderLeft: `4px solid #${color || '444'}` }}>
        <span className="seed">{seed > 0 ? seed : ''}</span>
        {teamLogo ? (
          <img src={teamLogo} alt={teamAbbr} className="team-logo" />
        ) : (
          <div className="team-logo-placeholder" />
        )}
        <span className="team-abbr">{teamAbbr || 'TBD'}</span>
      </div>
    );
  };

  const renderMatch = (match: any, index?: number) => {
    if (!match) return <div className="bracket-match placeholder">TBD</div>;
    return (
      <div 
        className={`bracket-match ${isAdmin ? 'admin-clickable' : ''}`} 
        onClick={() => isAdmin && onSeriesClick && onSeriesClick(match)}
        key={match.id}
      >
        {renderTeam(match.team_home, match.team_home_logo, match.team_home_seed, match.team_home_color, match.actual_winner)}
        <div className="match-divider"></div>
        {renderTeam(match.team_away, match.team_away_logo, match.team_away_seed, match.team_away_color, match.actual_winner)}
        {match.actual_winner && <div className="match-status-badge">Final</div>}
      </div>
    );
  };

  const renderColumn = (matches: any[], title: string, side: 'left' | 'right' | 'center', roundClass: string) => (
    <div className={`bracket-column ${side} ${roundClass}`}>
      <h4 className="column-title">{title}</h4>
      <div className="matches-container">
        {matches.map((m, i) => (
          <div className="match-wrapper" key={i}>
            {renderMatch(m, i)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bracket-scroll-wrapper">
      <div className="bracket-container">
        {/* West Side */}
        <div className="bracket-half west-half">
          {renderColumn(playInW, 'Play-In', 'left', 'round-playin')}
          {renderColumn(round1W, '1ra Ronda', 'left', 'round-1')}
          {renderColumn(semisW, 'Semifinales', 'left', 'round-2')}
          {renderColumn(finalsW, 'Final Conf', 'left', 'round-3')}
        </div>

        {/* Center - NBA Finals */}
        <div className="bracket-center">
          {renderColumn(nbaFinals, 'Finals', 'center', 'round-finals')}
        </div>

        {/* East Side */}
        <div className="bracket-half east-half">
          {renderColumn(finalsE, 'Final Conf', 'right', 'round-3')}
          {renderColumn(semisE, 'Semifinales', 'right', 'round-2')}
          {renderColumn(round1E, '1ra Ronda', 'right', 'round-1')}
          {renderColumn(playInE, 'Play-In', 'right', 'round-playin')}
        </div>
      </div>
    </div>
  );
}
