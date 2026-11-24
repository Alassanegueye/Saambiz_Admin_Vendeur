import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../layout/TopNav';
import TransitionPage from './TransitionPage';
import LoadingSpinner from '../common/LoadingSpinner';
import { ROUTES } from '../../constants/routes';
import useInactivityLogout from '../../hooks/useInactivityLogout';
import { useAuth } from '../../hooks/useAuth';

/**
 * Rubriques du vendeur — fixes, contrairement à l'administration : un vendeur
 * a toujours accès aux mêmes outils, ceux de l'application mobile.
 */
const ITEMS = [
  {
    code: 'ACCUEIL',
    to: ROUTES.DASHBOARD,
    label: 'Accueil',
    end: true,
    icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  },
  {
    code: 'PRODUITS',
    to: ROUTES.PRODUITS,
    label: 'Mes produits',
    icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  },
  {
    code: 'COMMANDES',
    to: ROUTES.COMMANDES,
    label: 'Commandes',
    icon: <><path d="M9 11V6a3 3 0 0 1 6 0v5"/><rect x="3" y="11" width="18" height="10" rx="2"/></>,
  },
  {
    code: 'PROMOTIONS',
    to: ROUTES.PROMOTIONS,
    label: 'Promotions',
    icon: <><path d="m3 11 8-8 10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/></>,
  },
  {
    // Une seule page : le site, les produits qu'il montre et, derrière un
    // bouton, les infos de la boutique. « Mon site » et « Sections du site »
    // y renvoient (voir AppRoutes).
    code: 'BOUTIQUE',
    to: ROUTES.BOUTIQUE,
    label: 'Ma boutique',
    icon: <><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6h6v6"/></>,
  },
];

/**
 * Messages et Abonnement vivent dans le menu du compte, pas dans la barre.
 *
 * La barre porte ce dont on se sert pour vendre — produits, commandes,
 * boutique. Ces deux rubriques-là se consultent de temps en temps : elles
 * encombraient une barre déjà pleine. Un message non lu reste visible, la
 * pastille du compte l'annonce (voir TopNav).
 *
 * Leur titre doit rester connu de l'écran de transition, d'où ces deux
 * lignes : `TITRES` se construit à partir de `ITEMS`, dont elles sont
 * sorties.
 */
const HORS_BARRE = {
  [ROUTES.MESSAGES]: 'Messages',
  [ROUTES.ABONNEMENT]: 'Abonnement',
  // Portées depuis l'application mobile. Sans leur titre ici, l'écran de
  // transition changerait de page sans dire laquelle.
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.ABONNES]: 'Abonnés',
  [ROUTES.AIDE]: 'Aide',
};

/** Nom affiché sous le logo pendant le changement de page. */
const TITRES = {
  ...Object.fromEntries(ITEMS.map((i) => [i.to, i.label])),
  ...HORS_BARRE,
  [ROUTES.PROFIL]: 'Mon profil',
};

export default function VendeurLayout() {
  const { logout } = useAuth();
  useInactivityLogout(logout);

  return (
    <div className="admin-layout">
      {/* Une rubrique, un onglet : Accueil, Mes produits, Commandes,
          Promotions, Ma boutique. */}
      <TopNav items={ITEMS} />
      <div className="admin-main">
        <div className="admin-content">
          {/* Le logo se dessine à chaque changement de page. L'attente d'une
              page chargée à la demande se fait ici, sous la barre de
              navigation, et non plus à la place de toute l'interface. */}
          <TransitionPage titres={TITRES}>
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Outlet />
            </Suspense>
          </TransitionPage>
        </div>
      </div>
    </div>
  );
}
