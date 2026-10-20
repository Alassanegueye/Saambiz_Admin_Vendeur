export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '—';
  const n = Number(montant);
  if (isNaN(n)) return '—';
  return n.toLocaleString('fr-FR') + ' FCFA';
};

/**
 * Libellé lisible d'une valeur technique (statut, formule, moyen de
 * paiement…) : « essai » → « Essai », « expire » → « Expiré »,
 * « orange_money » → « Orange Money ». Une valeur inconnue prend une
 * majuscule initiale et des espaces à la place des « _ » : rien ne
 * s'affiche jamais en minuscules brutes.
 */
const LIBELLES = {
  // Comptes
  actif: 'Actif', active: 'Actif', inactif: 'Inactif', inactive: 'Inactif',
  suspendu: 'Suspendu', bloque: 'Bloqué',
  // Abonnements
  essai: 'Essai', mensuel: 'Mensuel', annuel: 'Annuel', trimestriel: 'Trimestriel',
  premium: 'Premium', gratuit: 'Gratuit', expire: 'Expiré', revoque: 'Révoqué',
  // Traitements, paiements
  en_attente: 'En attente', en_cours: 'En cours', traite: 'Traité', rejete: 'Rejeté',
  valide: 'Validé', approuve: 'Approuvé', reussi: 'Réussi', echoue: 'Échoué', echec: 'Échec',
  paye: 'Payé', non_paye: 'Non payé', rembourse: 'Remboursé', annule: 'Annulé',
  confirmee: 'Confirmée', en_preparation: 'En préparation', prete: 'Prête',
  en_livraison: 'En livraison', livree: 'Livrée', annulee: 'Annulée',
  // Moyens et modes
  wave: 'Wave', orange_money: 'Orange Money', free_money: 'Free Money', om: 'Orange Money',
  carte: 'Carte bancaire', especes: 'Espèces', en_ligne: 'En ligne',
  a_la_livraison: 'À la livraison', livraison: 'Livraison', retrait: 'Retrait en boutique',
  abonnement: 'Abonnement', commande: 'Commande',
  // Rôles
  superadmin: 'Super admin', admin: 'Administrateur', vendeur: 'Vendeur', acheteur: 'Client',
};

export const libelle = (valeur) => {
  if (valeur === null || valeur === undefined || valeur === '') return '—';
  const v = String(valeur).trim();
  const connu = LIBELLES[v.toLowerCase()];
  if (connu) return connu;
  const texte = v.replace(/_/g, ' ');
  return texte.charAt(0).toLocaleUpperCase('fr-FR') + texte.slice(1);
};

export const formatStatut = (statut) => libelle(statut);
