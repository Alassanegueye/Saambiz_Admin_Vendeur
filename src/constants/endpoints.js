/**
 * Endpoints de l'API SaamBiz utilisés par l'espace vendeur.
 *
 * Extrait de la table complète du back-office : cette application n'appelle
 * que les routes du vendeur, de son compte et de ses commandes.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN:               '/auth/login',
    LOGOUT:              '/auth/logout',
    REFRESH:             '/auth/refresh',
    ME:                  '/account/me',
    CHANGER_MOT_DE_PASSE: '/auth/changer-mot-de-passe',

    // Inscription (mêmes routes que l'application mobile) : code par email,
    // jeton, puis création du compte.
    INSCRIPTION_CODE:    '/auth/inscription/envoyer-code',
    INSCRIPTION_VERIFIER: '/auth/inscription/verifier-code',
    REGISTER:            '/auth/register',
  },

  COMPTE: {
    MODIFIER_PROFIL: '/account/modifier-profil',
  },

  VENDEUR: {
    DASHBOARD:        '/vendeur/dashboard',
    STATISTIQUES:     '/vendeur/statistiques',
    STATISTIQUES_VUES:'/vendeur/statistiques-vues',

    // Produits
    PRODUITS:         '/vendeur/liste-produits',
    RECHERCHE:        '/vendeur/recherche-produits',
    NOMBRE_PRODUITS:  '/vendeur/nombre-produit',
    AJOUT_PRODUIT:    '/vendeur/ajout-produit',
    MODIF_PRODUIT:    (id) => `/vendeur/modifier-produit/${id}`,
    SUPPR_PRODUIT:    (id) => `/vendeur/supprimer-produit/${id}`,
    DISPONIBILITE:    (id) => `/vendeur/produit/${id}/disponibilite`,
    DUPLIQUER:        (id) => `/vendeur/produit/${id}/dupliquer`,
    IMAGES:           (id) => `/vendeur/produit/${id}/images`,

    // Boutique
    MA_BOUTIQUE:      '/vendeur/ma-boutique',
    CREER_BOUTIQUE:   '/vendeur/creer-boutique',
    MODIFIER_BOUTIQUE:'/vendeur/modifier-boutique',
    BOUTIQUE_PAUSE:   '/vendeur/boutique/pause',
    BOUTIQUE_REACTIVER:'/vendeur/boutique/reactiver',

    // Vitrine : le site web public de la boutique (saambiz.com/b/<slug>)
    MA_VITRINE:       '/vendeur/ma-vitrine',
    MA_VITRINE_APERCU:'/vendeur/ma-vitrine/apercu',

    // Abonnement
    MON_ABONNEMENT:   '/vendeur/mon-abonnement',
    RENOUVELER:       '/vendeur/initier-renouvellement',
    HISTORIQUE_PAIEMENTS: '/vendeur/historique-paiements',

    // Conversations
    CONVERSATIONS:    '/vendeur/mes-conversations',

    // Vérification du profil (pièce justificative examinée par un admin)
    SOUMETTRE_VERIFICATION: '/vendeur/soumettre-verification',
    STATUT_VERIFICATION:    '/vendeur/statut-verification',
  },

  COMMANDES_VENDEUR: {
    LIST:    '/commandes/vendeur',
    DETAIL:  (id) => `/commandes/${id}`,
    STATUT:  (id) => `/commandes/${id}/statut`,
  },

  PROMOTIONS: {
    LIST:   '/promotions/',
    CREATE: '/promotions/',
    UPDATE: (id) => `/promotions/${id}`,
    DELETE: (id) => `/promotions/${id}`,
  },

  CATEGORIES: {
    LIST:   '/categories/',                         // GET public
    CREATE: '/admin/ajout-categorie',               // POST (admin)
    UPDATE: (id) => `/admin/categorie/${id}`,       // PUT (admin)
    DELETE: (id) => `/admin/categorie/${id}`,       // DELETE (admin)
  },
};
