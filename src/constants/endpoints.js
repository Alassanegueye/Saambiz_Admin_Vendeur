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
    // Photos du haut du site, qui défilent dans le bandeau de l'accueil.
    MA_VITRINE_PHOTOS:       '/vendeur/ma-vitrine/photos',
    MA_VITRINE_PHOTOS_ORDRE: '/vendeur/ma-vitrine/photos/ordre',
    MA_VITRINE_PHOTO:        (id) => `/vendeur/ma-vitrine/photos/${id}`,

    // Abonnement
    MON_ABONNEMENT:   '/vendeur/mon-abonnement',
    // Ne fait qu'annoncer le montant dû : le paiement lui-même passe par
    // PAIEMENT.PAYER, en second temps, comme dans l'application mobile.
    RENOUVELER:       '/vendeur/initier-renouvellement',
    HISTORIQUE_PAIEMENTS: '/vendeur/historique-paiements',

    // Conversations
    CONVERSATIONS:    '/vendeur/mes-conversations',

    // Messages laissés sur la page Contact du site de la boutique
    MESSAGES_SITE:    '/messages/site',
    MESSAGE_SITE_LU:  (id) => `/messages/site/${id}/lire`,
    MESSAGE_SITE:     (id) => `/messages/site/${id}`,

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

  // Le catalogue des catégories est en lecture seule ici : les créer et les
  // modifier est un geste d'administrateur, sur des routes `/admin/*` qu'un
  // jeton de vendeur se voit refuser. Les garder déclarées ici ne pouvait que
  // tromper : le jour où un bouton les aurait appelées, il aurait reçu un 403.
  CATEGORIES: {
    LIST: '/categories/', // GET public
  },

  PAIEMENT: {
    // Le paiement réel, celui que l'application mobile appelle après
    // l'initiation : { methode, montant, numeroTelephone }.
    PAYER: '/paiement/payer',
  },
};
