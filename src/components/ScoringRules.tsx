export default function ScoringRules() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: '16px' }}>
        <h1 className="hero__title" style={{ fontSize: '2rem' }}>Reglas del Prode</h1>
        <p className="hero__subtitle" style={{ fontSize: '0.9rem' }}>
          Todo lo que necesitás saber para participar
        </p>
      </div>

      {/* How it works */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">📋</span>
          ¿Cómo funciona?
        </h2>
        <div className="rules-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Registrate con tu email y elegí un nombre',
              'Para cada serie, predecí quién gana y en cuántos juegos (4 a 7)',
              'Las predicciones se cierran cuando la serie comienza',
              'Una vez cerradas, podés ver las predicciones de todos',
              'Cuando la serie termina, se calculan los puntos automáticamente',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  color: 'var(--primary)',
                  minWidth: '24px',
                }}>
                  {i + 1}.
                </span>
                <span className="body-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">🏆</span>
          Sistema de Puntaje
        </h2>
        <div className="rules-card">
          <div className="rules-item">
            <span className="rules-item__label">Acertar el ganador de la serie</span>
            <span className="rules-item__points">1 punto</span>
          </div>
          <div className="rules-item">
            <span className="rules-item__label">Bonus: Acertar la cantidad exacta de juegos</span>
            <span className="rules-item__points">+2 puntos</span>
          </div>
          <div className="rules-item" style={{ borderTop: '2px solid var(--primary)', paddingTop: '16px' }}>
            <span className="rules-item__label" style={{ fontWeight: 700 }}>Máximo por serie</span>
            <span className="rules-item__points" style={{ fontSize: '1.3rem' }}>3 puntos</span>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-title__icon">⏰</span>
          Tiempos
        </h2>
        <div className="rules-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '🟢', title: 'Serie Abierta', desc: 'Podés hacer o editar tu predicción. Solo vos ves la tuya.' },
              { icon: '🟠', title: 'Serie En Juego', desc: 'Predicciones cerradas. Ahora todos pueden ver las predicciones de todos.' },
              { icon: '⚪', title: 'Serie Finalizada', desc: 'Se calculan los puntos automáticamente en base al resultado real.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <div className="title-md" style={{ marginBottom: '4px' }}>{item.title}</div>
                  <div className="body-md text-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
