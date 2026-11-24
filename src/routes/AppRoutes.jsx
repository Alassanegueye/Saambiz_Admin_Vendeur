import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { lazyFiable } from '../utils/nouvelleVersion';
import VendeurRoute from './VendeurRoute';
import GuestRoute from './GuestRoute';
import VendeurLayout from '../components/layouts/VendeurLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES } from '../constants/routes';

const ConnexionPage  = lazyFiable(() => import('../pages/auth/VendeurLoginPage'));
const InscriptionPage = lazyFiable(() => import('../pages/auth/InscriptionPage'));
const DashboardPage  = lazyFiable(() => import('../pages/tableau-de-bord/DashboardPage'));
const ProduitsPage   = lazyFiable(() => import('../pages/produits/ProduitsPage'));
const CommandesPage  = lazyFiable(() => import('../pages/commandes/CommandesPage'));
const PromotionsPage = lazyFiable(() => import('../pages/promotions/PromotionsPage'));
const BoutiquePage   = lazyFiable(() => import('../pages/boutique/BoutiquePage'));
const MessagesPage   = lazyFiable(() => import('../pages/messages/MessagesPage'));
const AbonnementPage = lazyFiable(() => import('../pages/abonnement/AbonnementPage'));
const ProfilPage     = lazyFiable(() => import('../pages/profil/ProfilPage'));
const NotificationsPage = lazyFiable(() => import('../pages/notifications/NotificationsPage'));
const AbonnesPage    = lazyFiable(() => import('../pages/abonnes/AbonnesPage'));
const AidePage       = lazyFiable(() => import('../pages/aide/AidePage'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.LOGIN} element={
              <ErrorBoundary><ConnexionPage /></ErrorBoundary>
            } />
            <Route path={ROUTES.INSCRIPTION} element={
              <ErrorBoundary><InscriptionPage /></ErrorBoundary>
            } />
          </Route>

          <Route element={<VendeurRoute />}>
            <Route element={<VendeurLayout />}>
              <Route path={ROUTES.DASHBOARD}  element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
              <Route path={ROUTES.PRODUITS}   element={<ErrorBoundary><ProduitsPage /></ErrorBoundary>} />
              <Route path={ROUTES.COMMANDES}  element={<ErrorBoundary><CommandesPage /></ErrorBoundary>} />
              <Route path={ROUTES.PROMOTIONS} element={<ErrorBoundary><PromotionsPage /></ErrorBoundary>} />
              <Route path={ROUTES.BOUTIQUE}   element={<ErrorBoundary><BoutiquePage /></ErrorBoundary>} />
              {/* Anciennes adresses : « Mon site » et « Sections du site »
                  vivent désormais dans « Ma boutique ». Les liens déjà
                  partagés ou enregistrés y mènent toujours. */}
              <Route path={ROUTES.VITRINE}    element={<Navigate to={ROUTES.BOUTIQUE} replace />} />
              <Route path={ROUTES.SECTIONS}   element={<Navigate to={`${ROUTES.BOUTIQUE}?etape=sections`} replace />} />
              <Route path={ROUTES.MESSAGES}   element={<ErrorBoundary><MessagesPage /></ErrorBoundary>} />
              <Route path={ROUTES.ABONNEMENT} element={<ErrorBoundary><AbonnementPage /></ErrorBoundary>} />
              <Route path={ROUTES.PROFIL}     element={<ErrorBoundary><ProfilPage /></ErrorBoundary>} />
              <Route path={ROUTES.NOTIFICATIONS} element={<ErrorBoundary><NotificationsPage /></ErrorBoundary>} />
              <Route path={ROUTES.ABONNES}    element={<ErrorBoundary><AbonnesPage /></ErrorBoundary>} />
              <Route path={ROUTES.AIDE}       element={<ErrorBoundary><AidePage /></ErrorBoundary>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
