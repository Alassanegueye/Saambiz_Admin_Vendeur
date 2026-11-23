/**
 * L'état d'un produit tel que le vendeur doit le lire, dans l'ordre où les
 * causes se masquent les unes les autres. Mêmes règles et mêmes mots que
 * l'application mobile (`statutProduitVendeur`, `mes_produits_page.dart`) :
 * un vendeur qui passe du téléphone au web doit lire la même chose.
 *
 * La modération d'abord : un produit refusé ou en attente reste invisible
 * pour les clients, même en vente et même en stock. Le web ne le disait pas
 * du tout — le vendeur voyait « En vente » un produit que personne ne pouvait
 * voir ni commander, sans rien pour le lui expliquer.
 */

export const MODERATION = {
  rejete: { label: 'Refusé par la modération', variant: 'danger' },
  en_attente: { label: 'En attente de validation', variant: 'warning' },
};

export function statutProduit(produit) {
  const moderation = MODERATION[produit.statut];
  if (moderation) return moderation;
  if ((produit.disponible ?? true) === false) return { label: 'Retiré', variant: 'default' };
  if (Number(produit.quantite ?? 1) <= 0) return { label: 'Rupture', variant: 'danger' };
  return { label: 'En vente', variant: 'success' };
}

/** Vu par les clients : approuvé, en vente, et encore en stock. */
export const visiblePourLesClients = (produit) =>
  (produit.disponible ?? true)
  && (produit.statut ?? 'approuve') === 'approuve'
  && Number(produit.quantite ?? 1) > 0;

/** En attente de validation ou refusé : à l'arrêt tant que la modération n'a pas tranché. */
export const enModeration = (produit) => Boolean(MODERATION[produit.statut]);
