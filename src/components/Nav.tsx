import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface NavProps {
  currentPath: string;
}

export default function Nav({ currentPath }: NavProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const links = [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/predicciones', label: 'Predicciones', icon: '🏀' },
    { href: '/posiciones', label: 'Posiciones', icon: '🏆' },
    { href: '/reglas', label: 'Reglas', icon: '📋' },
  ];

  const isAdmin = user?.email === import.meta.env.PUBLIC_ADMIN_EMAIL;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <a href="/" className="navbar__brand">ProdeNBA</a>
        <ul className="navbar__links">
          {links.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`navbar__link ${currentPath === link.href ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </a>
            </li>
          ))}
          {isAdmin && (
            <li>
              <a
                href="/admin"
                className={`navbar__link ${currentPath === '/admin' ? 'navbar__link--active' : ''}`}
              >
                Admin
              </a>
            </li>
          )}
        </ul>
        <div className="navbar__user">
          {user ? (
            <>
              <div className="navbar__avatar">
                {(user.user_metadata?.display_name || user.email)?.[0]?.toUpperCase() || '?'}
              </div>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <a href="/login" className="btn btn--primary btn--sm">Entrar</a>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <ul className="bottom-nav__items">
          {links.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`bottom-nav__item ${currentPath === link.href ? 'bottom-nav__item--active' : ''}`}
              >
                <span className="bottom-nav__icon">{link.icon}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
