/**
 * Les quatre statuts d'un paiement, tels que le modèle backend les écrit
 * (`paiement.model.js` : `ENUM('pending', 'success', 'failed', 'cancelled')`).
 *
 * La page en attendait deux autres — « reussi » et « paye » — qui n'existent
 * nulle part côté serveur. Conséquence : aucun paiement n'était jamais marqué
 * comme réussi, tous portaient la pastille grise, et le statut s'affichait en
 * anglais, « Success », faute d'être traduit.
 */
export const STATUTS_PAIEMENT = {
  pending:   { label: 'En attente', variant: 'warning' },
  success:   { label: 'Réussi',     variant: 'success' },
  failed:    { label: 'Échoué',     variant: 'danger' },
  cancelled: { label: 'Annulé',     variant: 'default' },
};

export const infoPaiement = (statut) =>
  STATUTS_PAIEMENT[statut] || { label: statut || '—', variant: 'default' };

/** Les deux seuls opérateurs branchés (`METHODES_SUPPORTEES` côté serveur). */
export const MOYENS = {
  wave: 'Wave',
  orange_money: 'Orange Money',
};

export const nomMoyen = (methode) => MOYENS[methode] || '—';
