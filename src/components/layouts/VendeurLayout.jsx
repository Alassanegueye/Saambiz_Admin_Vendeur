import { Outlet } from 'react-router-dom';
import TopNav from '../layout/TopNav';
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
    code: 'BOUTIQUE',
    to: ROUTES.BOUTIQUE,
    label: 'Infos de la boutique',
    icon: <><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6h6v6"/></>,
  },
  {
    code: 'VITRINE',
    to: ROUTES.VITRINE,
    label: 'Mon site',
    icon: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></>,
  },
  {
    code: 'SECTIONS',
    to: ROUTES.SECTIONS,
    label: 'Sections du site',
    icon: <><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></>,
  },
  {
    code: 'MESSAGES',
    to: ROUTES.MESSAGES,
    label: 'Messages',
    icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  },
  {
    code: 'ABONNEMENT',
    to: ROUTES.ABONNEMENT,
    label: 'Abonnement',
    icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  },
];

export default function VendeurLayout() {
  const { logout } = useAuth();
  useInactivityLogout(logout);

  return (
    <div className="admin-layout">
      {/* Rubriques regroupées comme dans l'administration : Accueil, Mes
          produits, Ventes ▾, Ma boutique ▾, Messages, Abonnement. */}
      <TopNav items={ITEMS} />
      <div className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
