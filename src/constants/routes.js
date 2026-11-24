/**
 * Routes de l'espace vendeur.
 *
 * Application distincte de l'administration : les chemins repartent de la
 * racine, il n'y a plus de préfixe « /vendeur » à traîner.
 */
export const ROUTES = {
  LOGIN:      '/connexion',
  INSCRIPTION:'/inscription',
  DASHBOARD:  '/',
  PRODUITS:   '/produits',
  COMMANDES:  '/commandes',
  PROMOTIONS: '/promotions',
  // Le site, les produits qu'il montre et les infos de la boutique : une
  // seule page. Les deux adresses suivantes y renvoient (voir AppRoutes).
  BOUTIQUE:   '/boutique',
  VITRINE:    '/mon-site',
  SECTIONS:   '/sections-du-site',
  MESSAGES:   '/messages',
  ABONNEMENT: '/abonnement',
  PROFIL:     '/profil',
  // Portés depuis l'application mobile, où le vendeur les avait déjà.
  NOTIFICATIONS: '/notifications',
  ABONNES:       '/abonnes',
  AIDE:          '/aide',
};

// Ancien nom, conservé le temps que les pages reprises de l'administration
// soient toutes alignées. Les deux pointent sur le même objet.
export const VENDEUR_ROUTES = ROUTES;
