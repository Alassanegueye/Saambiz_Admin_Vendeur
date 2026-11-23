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
    // Suppression du compte par son propriétaire. L'application mobile la
    // propose — Google Play l'exige de toute application qui crée des
    // comptes — et le web ne l'offrait pas.
    SUPPRIMER:       '/account/me',
  },

  VENDEUR: {
    DASHBOARD:        '/vendeur/dashboard',
    STATISTIQUES:     '/vendeur/statistiques',
    STATISTIQUES_VUES:'/vendeur/statistiques-vues',

    // Produits
    PRODUITS:         '/vendeur/liste-produits',
    RECHERCHE:        '/vendeur/recherche-produits',
    NOMBRE_PRODUITS:  '/vendeur/nombre-produit',
    PRODUITS_PAR_CATEGORIE: '/vendeur/nombre-produit-categorie',
    AJOUT_PRODUIT:    '/vendeur/ajout-produit',
    MODIF_PRODUIT:    (id) => `/vendeur/modifier-produit/${id}`,
    SUPPR_PRODUIT:    (id) => `/vendeur/supprimer-produit/${id}`,
    DISPONIBILITE:    (id) => `/vendeur/produit/${id}/disponibilite`,
    DUPLIQUER:        (id) => `/vendeur/produit/${id}/dupliquer`,
    IMAGES:           (id) => `/vendeur/produit/${id}/images`,
    IMAGE:            (id, imageId) => `/vendeur/produit/${id}/images/${imageId}`,

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
    // L'acheteur demande l'annulation d'une commande déjà engagée ; le
    // vendeur accepte ou refuse. PATCH, là où le POST est celui de l'acheteur.
    DEMANDE_ANNULATION: (id) => `/commandes/${id}/demande-annulation`,
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

  // Messagerie avec les acheteurs. L'application mobile s'appuie en plus sur
  // une socket pour le temps réel ; ici on lit et on répond par ces routes.
  MESSAGES: {
    CONVERSATION: (userId) => `/messages/${userId}`,
    ENVOYER:      '/messages',
    LU:           (id) => `/messages/${id}/lire`,
    // Le compte de messages non lus, pour une pastille dans la navigation.
    NON_LUS:      '/messages/non-lus',
  },

  PAIEMENT: {
    // Le paiement réel, celui que l'application mobile appelle après
    // l'initiation : { methode, montant, numeroTelephone }.
    PAYER: '/paiement/payer',
  },

  // Les alertes du compte : commande reçue, abonnement qui approche de son
  // terme, produit modéré. L'application mobile les affiche depuis toujours ;
  // le tableau de bord web n'en montrait aucune, alors que son accueil reçoit
  // déjà le compte des non-lues du serveur.
  NOTIFICATIONS: {
    LIST:        '/notifications',
    NON_LUES:    '/notifications/non-lues',
    TOUTES_LUES: '/notifications/toutes-lues',
    LUE:         (id) => `/notifications/${id}/lire`,
  },

  // Les clients qui suivent la boutique. Le web n'en donnait que le nombre.
  ABONNES: {
    LIST:   '/vendeur/abonnes',
    DETAIL: (id) => `/vendeur/abonnes/${id}`,
  },

  // Réglages publics, servis sans authentification.
  CONFIG: {
    // Contacts et questions fréquentes, rédigés depuis le back-office.
    CENTRE_AIDE:     '/centre-aide',
    // { prix, devise } — le tarif affiché avant de renouveler.
    PRIX_ABONNEMENT: '/prix-abonnement',
  },
};
