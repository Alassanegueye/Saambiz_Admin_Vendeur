import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import PICTO from '../../assets/images/picto-saambiz.png';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { AIDES, construireNavigation, estActif } from './navigationVendeur';

/**
 * Barre du haut de l'espace vendeur (même modèle que l'administration), dans le style du dashboard Yobante
 * Boutique :
 *  - pictogramme à gauche ;
 *  - rubriques regroupées par sujet (menus dépliants), centrées, sans menu
 *    « Plus » ;
 *  - rubrique active repérée par un simple soulignement, sans fond coloré ;
 *  - à droite, les initiales et le nom de l'administrateur connecté ; nom, email et
 *    rôle ne s'affichent que dans le menu de compte.
 * Sous 1024 px, un tiroir liste l'arborescence complète.
 */

function Icone({ children, taille = 16 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const Chevron = ({ ouvert }) => (
  <svg className={`tn-chevron${ouvert ? ' ouvert' : ''}`} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function TopNav({ items = [] }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const nav = useMemo(() => construireNavigation(items), [items]);

  const [groupeOuvert, setGroupeOuvert] = useState(null);
  const [menuCompte, setMenuCompte] = useState(false);
  const [tiroir, setTiroir] = useState(false);
  const barreRef = useRef(null);

  const initiales = user
    ? `${(user.prenom || '')[0] || ''}${(user.nom || '')[0] || ''}`.toUpperCase() || 'A'
    : 'A';
  const nomComplet = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email : '';

  // Tout se referme en changeant de page (réglé pendant le rendu plutôt que
  // dans un effet, pour éviter un second rendu en cascade).
  const [cheminVu, setCheminVu] = useState(pathname);
  if (cheminVu !== pathname) {
    setCheminVu(pathname);
    setGroupeOuvert(null);
    setMenuCompte(false);
    setTiroir(false);
  }

  // Clic à l'extérieur ou Échap : menus refermés.
  useEffect(() => {
    if (!groupeOuvert && !menuCompte) return undefined;
    const clic = (e) => {
      if (barreRef.current && !barreRef.current.contains(e.target)) {
        setGroupeOuvert(null);
        setMenuCompte(false);
      }
    };
    const touche = (e) => {
      if (e.key === 'Escape') { setGroupeOuvert(null); setMenuCompte(false); }
    };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
    };
  }, [groupeOuvert, menuCompte]);

  const accueil = items.find((i) => i.to === '/')?.to || items[0]?.to || '/';

  return (
    <header className="tn" ref={barreRef}>
      <div className="tn-barre">
        <button
          type="button"
          className="tn-burger"
          onClick={() => { setGroupeOuvert(null); setMenuCompte(false); setTiroir((o) => !o); }}
          aria-label={tiroir ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={tiroir}
        >
          <Icone taille={22}>
            {tiroir
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </Icone>
        </button>

        <NavLink to={accueil} className="tn-marque" title="SaamBiz — Espace vendeur">
          <img src={PICTO} alt="SaamBiz" />
        </NavLink>

        <nav className="tn-rubriques" aria-label="Menu principal">
          <ul>
            {nav.length === 0 && <li className="tn-vide">Aucune rubrique disponible</li>}
            {nav.map((entree) => {
              if (entree.type === 'lien') {
                const { item } = entree;
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end}
                             className={() => `tn-onglet${estActif(item, pathname) ? ' actif' : ''}`}>
                      <Icone>{item.icon}</Icone>
                      {item.label}
                    </NavLink>
                  </li>
                );
              }
              const actif = entree.enfants.some((e) => estActif(e, pathname));
              const ouvert = groupeOuvert === entree.label;
              return (
                <li key={entree.label} className="tn-groupe">
                  <button
                    type="button"
                    className={`tn-onglet${actif ? ' actif' : ''}${ouvert ? ' ouvert' : ''}`}
                    onClick={() => { setMenuCompte(false); setGroupeOuvert(ouvert ? null : entree.label); }}
                    aria-haspopup="menu"
                    aria-expanded={ouvert}
                  >
                    <Icone>{entree.icone}</Icone>
                    {entree.label}
                    <Chevron ouvert={ouvert} />
                  </button>
                  {ouvert && (
                    <div className="tn-menu tn-menu-groupe" role="menu" aria-label={entree.label}>
                      {entree.enfants.map((enfant) => {
                        const courant = estActif(enfant, pathname);
                        return (
                          <button
                            key={enfant.to}
                            type="button"
                            role="menuitem"
                            className={`tn-menu-page${courant ? ' courant' : ''}`}
                            onClick={() => navigate(enfant.to)}
                          >
                            <span className="tn-menu-icone"><Icone>{enfant.icon}</Icone></span>
                            <span className="tn-menu-textes">
                              <span className="tn-menu-titre">{enfant.label}</span>
                              {AIDES[enfant.code] && <span className="tn-menu-aide">{AIDES[enfant.code]}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Compte : initiales et nom de l'administrateur connecté. */}
        <div className="tn-compte">
          <button
            type="button"
            className={`tn-compte-btn${menuCompte ? ' ouvert' : ''}`}
            onClick={() => { setGroupeOuvert(null); setTiroir(false); setMenuCompte((o) => !o); }}
            aria-haspopup="menu"
            aria-expanded={menuCompte}
            title={nomComplet}
          >
            <span className="tn-avatar" aria-hidden="true">{initiales}</span>
            <span className="tn-compte-nom">{nomComplet}</span>
            <Chevron ouvert={menuCompte} />
          </button>

          {menuCompte && (
            <div className="tn-menu tn-menu-compte" role="menu">
              <div className="tn-menu-entete">
                <strong>{nomComplet}</strong>
                {user?.email && <span>{user.email}</span>}
              </div>
              <NavLink to={ROUTES.PROFIL} className="tn-menu-lien" role="menuitem">
                <Icone><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icone>
                Mon profil
              </NavLink>
              <button type="button" className="tn-menu-lien danger" onClick={logout} role="menuitem">
                <Icone><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icone>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tiroir (petits écrans) : l'arborescence complète, groupes compris. */}
      {tiroir && (
        <div className="tn-tiroir">
          {nav.map((entree) =>
            entree.type === 'lien' ? (
              <div key={entree.item.to} className="tn-tiroir-groupe">
                {entree.groupe && <p className="tn-tiroir-titre">{entree.groupe}</p>}
                <NavLink to={entree.item.to} end={entree.item.end}
                         className={() => `tn-tiroir-lien${estActif(entree.item, pathname) ? ' actif' : ''}`}>
                  <Icone>{entree.item.icon}</Icone>
                  {entree.item.label}
                </NavLink>
              </div>
            ) : (
              <div key={entree.label} className="tn-tiroir-groupe">
                <p className="tn-tiroir-titre">{entree.label}</p>
                {entree.enfants.map((enfant) => (
                  <NavLink key={enfant.to} to={enfant.to} end={enfant.end}
                           className={() => `tn-tiroir-lien${estActif(enfant, pathname) ? ' actif' : ''}`}>
                    <Icone>{enfant.icon}</Icone>
                    {enfant.label}
                  </NavLink>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
}
