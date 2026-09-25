import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import PICTO from '../../assets/images/picto-saambiz.png';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

/**
 * Barre de navigation horizontale — remplace le menu latéral.
 *
 * Les rubriques passent en haut : la page récupère toute la largeur, ce qui
 * profite aux tableaux, qui sont l'essentiel du back-office.
 *
 * Composant partagé par l'administration et l'espace vendeur ; seule la liste
 * `items` change (RBAC côté admin, liste fixe côté vendeur).
 */
export default function TopNav({ items = [], espace }) {
  const { user, logout } = useAuth();
  const [menuMobile, setMenuMobile] = useState(false);
  const [menuCompte, setMenuCompte] = useState(false);
  const compteRef = useRef(null);
  const listeRef = useRef(null);
  const [menuPlus, setMenuPlus] = useState(false);
  const plusRef = useRef(null);

  // Nombre de rubriques affichées en clair ; les suivantes passent dans le
  // menu « Plus ». Avec les icônes, quatorze rubriques dépassent la largeur
  // de n'importe quel écran : un débordement horizontal masquerait les
  // dernières derrière le bouton du compte, sans que rien ne l'indique.
  const [nbVisibles, setNbVisibles] = useState(items.length);
  const largeursRef = useRef([]);

  const initiales = user
    ? `${(user.prenom || '')[0] || ''}${(user.nom || '')[0] || ''}`.toUpperCase() || 'A'
    : 'A';
  const nomComplet = user
    ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email
    : 'Compte';

  // Fermeture du menu compte au clic extérieur et à l'échappement.
  useEffect(() => {
    if (!menuCompte) return;
    const clic = (e) => {
      if (compteRef.current && !compteRef.current.contains(e.target)) setMenuCompte(false);
    };
    const touche = (e) => { if (e.key === 'Escape') setMenuCompte(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
    };
  }, [menuCompte]);

  // Fermeture du menu « Plus » au clic extérieur.
  useEffect(() => {
    if (!menuPlus) return;
    const clic = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) setMenuPlus(false);
    };
    const touche = (e) => { if (e.key === 'Escape') setMenuPlus(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
    };
  }, [menuPlus]);

  // Repartition entre la barre et le menu « Plus ».
  //
  // Les largeurs sont mesurees une seule fois, toutes rubriques affichees,
  // puis conservees : apres le premier calcul les elements masques ne sont
  // plus mesurables. La largeur du conteneur, elle, ne depend pas du nombre
  // d'elements (flex: 1), on peut donc recalculer au redimensionnement.
  useLayoutEffect(() => {
    const nav = listeRef.current;
    if (!nav || items.length === 0) return;

    const LARGEUR_PLUS = 96; // bouton « Plus » + sa marge

    const repartir = () => {
      if (largeursRef.current.length !== items.length) {
        const liens = nav.querySelectorAll('.topnav-link:not(.topnav-plus-btn)');
        if (liens.length !== items.length) return; // mesure incomplete
        largeursRef.current = Array.from(liens).map((el) => el.offsetWidth + 2);
      }
      const largeurs = largeursRef.current;
      const dispo = nav.clientWidth;

      // Sous 1100 px la barre laisse place au tiroir : la liste est masquée,
      // sa largeur vaut 0. Sans ce garde-fou, le calcul conclurait que rien
      // ne tient et laisserait un « Plus » fantôme dans un conteneur caché.
      if (dispo === 0) { setNbVisibles(items.length); return; }

      const total = largeurs.reduce((a, b) => a + b, 0);
      if (total <= dispo) { setNbVisibles(items.length); return; }

      let cumul = 0;
      let n = 0;
      for (const l of largeurs) {
        if (cumul + l > dispo - LARGEUR_PLUS) break;
        cumul += l;
        n++;
      }
      setNbVisibles(Math.max(1, n));
    };

    repartir();
    const observateur = new ResizeObserver(repartir);
    observateur.observe(nav);
    return () => observateur.disconnect();
  }, [items]);

  const visibles = items.slice(0, nbVisibles);
  const caches = items.slice(nbVisibles);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        {/* Marque */}
        <NavLink to={items[0]?.to || '/'} className="topnav-brand" onClick={() => setMenuMobile(false)}>
          <img src={PICTO} alt="SaamBiz" />
          {espace && <span className="topnav-espace">{espace}</span>}
        </NavLink>

        {/* Rubriques — masquées sous 1100 px, reprises dans le tiroir */}
        <nav className="topnav-links" aria-label="Navigation principale" ref={listeRef}>
          {visibles.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
            >
              {item.icon && (
                <span className="topnav-link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                </span>
              )}
              <span>{item.label}</span>
            </NavLink>
          ))}
          {items.length === 0 && (
            <span className="topnav-vide">Aucune rubrique disponible</span>
          )}

          {caches.length > 0 && (
            <div className="topnav-plus" ref={plusRef}>
              <button
                className="topnav-link topnav-plus-btn"
                onClick={() => setMenuPlus((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuPlus}
              >
                <span>Plus</span>
                <svg className="topnav-chevron" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuPlus && (
                <div className="topnav-menu topnav-menu-plus" role="menu">
                  {caches.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className="topnav-menu-item"
                      role="menuitem"
                      onClick={() => setMenuPlus(false)}
                    >
                      {item.icon && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          {item.icon}
                        </svg>
                      )}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Compte */}
        <div className="topnav-account" ref={compteRef}>
          <button
            className="topnav-account-btn"
            onClick={() => setMenuCompte((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuCompte}
          >
            <span className="topnav-avatar" aria-hidden="true">{initiales}</span>
            <span className="topnav-account-name">{nomComplet}</span>
            <svg className="topnav-chevron" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {menuCompte && (
            <div className="topnav-menu" role="menu">
              <div className="topnav-menu-head">
                <strong>{nomComplet}</strong>
                <span>{user?.email}</span>
                <span className="topnav-menu-role">{user?.role}</span>
              </div>
              <NavLink
                to={ROUTES.PROFIL}
                className="topnav-menu-item"
                role="menuitem"
                onClick={() => setMenuCompte(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Mon profil
              </NavLink>
              <button className="topnav-menu-item danger" onClick={logout} role="menuitem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>

        <button
          className="topnav-burger"
          onClick={() => setMenuMobile((o) => !o)}
          aria-label={menuMobile ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuMobile}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuMobile ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Tiroir mobile */}
      <div className={`topnav-drawer${menuMobile ? ' open' : ''}`}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `topnav-drawer-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuMobile(false)}
            tabIndex={menuMobile ? 0 : -1}
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={ROUTES.PROFIL}
          className={({ isActive }) => `topnav-drawer-link${isActive ? ' active' : ''}`}
          onClick={() => setMenuMobile(false)}
          tabIndex={menuMobile ? 0 : -1}
        >
          Mon profil
        </NavLink>
        <button className="topnav-drawer-logout" onClick={logout} tabIndex={menuMobile ? 0 : -1}>
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
