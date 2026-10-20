import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import VendeurRoute from './VendeurRoute';
import GuestRoute from './GuestRoute';
import VendeurLayout from '../components/layouts/VendeurLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES } from '../constants/routes';

const ConnexionPage  = lazy(() => import('../pages/auth/VendeurLoginPage'));
const InscriptionPage = lazy(() => import('../pages/auth/InscriptionPage'));
const DashboardPage  = lazy(() => import('../pages/tableau-de-bord/DashboardPage'));
const ProduitsPage   = lazy(() => import('../pages/produits/ProduitsPage'));
const CommandesPage  = lazy(() => import('../pages/commandes/CommandesPage'));
const PromotionsPage = lazy(() => import('../pages/promotions/PromotionsPage'));
const BoutiquePage   = lazy(() => import('../pages/boutique/BoutiquePage'));
const VitrinePage    = lazy(() => import('../pages/vitrine/VitrinePage'));
const MessagesPage   = lazy(() => import('../pages/messages/MessagesPage'));
const AbonnementPage = lazy(() => import('../pages/abonnement/AbonnementPage'));
const ProfilPage     = lazy(() => import('../pages/profil/ProfilPage'));

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
              <Route path={ROUTES.VITRINE}    element={<ErrorBoundary><VitrinePage /></ErrorBoundary>} />
              <Route path={ROUTES.MESSAGES}   element={<ErrorBoundary><MessagesPage /></ErrorBoundary>} />
              <Route path={ROUTES.ABONNEMENT} element={<ErrorBoundary><AbonnementPage /></ErrorBoundary>} />
              <Route path={ROUTES.PROFIL}     element={<ErrorBoundary><ProfilPage /></ErrorBoundary>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
