/**
 * Le vocabulaire des commandes, et lui seul.
 *
 * Ce module ne dépend de rien : ni réseau, ni navigateur. C'est ce qui permet
 * de le comparer au backend dans un test, sans monter la moindre page.
 *
 * Les dix statuts sont ceux du modèle (`commande.model.js`), les libellés ceux
 * de `LIBELLES_STATUT` et la table des suites celle de `TRANSITIONS`
 * (`commande.service.js`) — les mêmes mots des deux côtés.
 *
 * Il en manquait trois : `acceptee`, `rejetee` et `payee`. Une commande dans
 * l'un de ces états affichait son code brut, et surtout les deux décisions qui
 * ouvrent le cycle — accepter, rejeter — n'étaient proposées nulle part.
 */

export const STATUTS = [
  { code: 'en_attente',     label: 'En attente',     variant: 'warning' },
  { code: 'acceptee',       label: 'Acceptée',       variant: 'info' },
  { code: 'rejetee',        label: 'Rejetée',        variant: 'danger' },
  { code: 'payee',          label: 'Payée',          variant: 'success' },
  { code: 'confirmee',      label: 'Confirmée',      variant: 'info' },
  { code: 'en_preparation', label: 'En préparation', variant: 'info' },
  { code: 'prete',          label: 'Prête',          variant: 'info' },
  { code: 'en_livraison',   label: 'En livraison',   variant: 'info' },
  { code: 'livree',         label: 'Livrée',         variant: 'success' },
  { code: 'annulee',        label: 'Annulée',        variant: 'danger' },
];

/**
 * Qui mène où. Le backend refuse tout le reste en 400. L'interface proposait
 * auparavant tous les statuts : depuis une commande en attente, six boutons
 * sur sept menaient à un refus du serveur.
 */
export const TRANSITIONS = {
  en_attente:     ['acceptee', 'rejetee', 'annulee'],
  acceptee:       ['en_preparation', 'annulee'],
  rejetee:        [],
  payee:          ['en_preparation', 'annulee'],
  confirmee:      ['en_preparation', 'annulee'],
  en_preparation: ['prete', 'annulee'],
  prete:          ['en_livraison', 'livree', 'annulee'], // retrait → livrée directement
  en_livraison:   ['livree', 'annulee'],
  livree:         [],
  annulee:        [],
};

/** Les statuts réellement atteignables depuis celui-ci, boutons compris. */
export const transitionsDepuis = (code) =>
  (TRANSITIONS[code] || []).map((c) => STATUTS.find((s) => s.code === c)).filter(Boolean);

export const infoStatut = (code) =>
  STATUTS.find((s) => s.code === code) || { label: code || '—', variant: 'default' };

/** Statuts « en cours » : acceptée, payée, confirmée, préparée, prête ou en route. */
export const EN_COURS = ['acceptee', 'payee', 'confirmee', 'en_preparation', 'prete', 'en_livraison'];

/** Filtres en pastilles : les étapes qui comptent pour le vendeur. */
export const FILTRES_COMMANDES = [
  { valeur: 'tous', libelle: 'Toutes' },
  { valeur: 'en_attente', libelle: 'À confirmer' },
  { valeur: 'en_cours', libelle: 'En cours' },
  { valeur: 'livree', libelle: 'Livrées' },
  { valeur: 'rejetee', libelle: 'Rejetées' },
  { valeur: 'annulee', libelle: 'Annulées' },
];

export const correspond = (commande, filtre) => {
  if (filtre === 'tous') return true;
  if (filtre === 'en_cours') return EN_COURS.includes(commande.statut);
  return commande.statut === filtre;
};
