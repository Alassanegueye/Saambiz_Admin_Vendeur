/**
 * Routes de l'espace vendeur.
 *
 * Application distincte de l'administration : les chemins repartent de la
 * racine, il n'y a plus de préfixe « /vendeur » à traîner.
 */
export const ROUTES = {
  LOGIN:      '/connexion',
  DASHBOARD:  '/',
  PRODUITS:   '/produits',
  COMMANDES:  '/commandes',
  PROMOTIONS: '/promotions',
  BOUTIQUE:   '/boutique',
  VITRINE:    '/mon-site',
  MESSAGES:   '/messages',
  ABONNEMENT: '/abonnement',
  PROFIL:     '/profil',
};

// Ancien nom, conservé le temps que les pages reprises de l'administration
// soient toutes alignées. Les deux pointent sur le même objet.
export const VENDEUR_ROUTES = ROUTES;
