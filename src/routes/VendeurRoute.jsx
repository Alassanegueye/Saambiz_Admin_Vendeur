import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

/**
 * Garde de l'application : tout est réservé aux comptes vendeur.
 *
 * Un compte d'un autre rôle n'a rien à faire ici — l'administration est une
 * application distincte, à sa propre adresse.
 */
export default function VendeurRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== 'Vendeur') return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
