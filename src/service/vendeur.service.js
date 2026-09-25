import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const { VENDEUR, COMMANDES_VENDEUR, PROMOTIONS } = ENDPOINTS;

/**
 * Espace vendeur — mêmes endpoints que l'application mobile.
 * Le backend identifie le vendeur à partir du jeton : aucune de ces requêtes
 * ne prend d'identifiant de boutique.
 */

// ── Tableau de bord ─────────────────────────────────────────────────────────
export const getDashboard        = () => api.get(VENDEUR.DASHBOARD);
export const getStatistiques     = () => api.get(VENDEUR.STATISTIQUES);
export const getStatistiquesVues = () => api.get(VENDEUR.STATISTIQUES_VUES);

// ── Produits ────────────────────────────────────────────────────────────────
export const getProduits    = () => api.get(VENDEUR.PRODUITS);
export const rechercherProduits = (q) => api.get(VENDEUR.RECHERCHE, { params: { q } });

/**
 * Création / modification : le backend attend du multipart (une image
 * principale + des images secondaires), on envoie donc un FormData même
 * lorsqu'aucun fichier n'est joint.
 */
function toFormData(valeurs, fichiers = {}) {
  const form = new FormData();
  Object.entries(valeurs).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== null && valeur !== '') {
      form.append(cle, valeur);
    }
  });
  if (fichiers.image) form.append('image', fichiers.image);
  (fichiers.images || []).forEach((f) => form.append('images', f));
  return form;
}

export const creerProduit = (valeurs, fichiers) =>
  api.post(VENDEUR.AJOUT_PRODUIT, toFormData(valeurs, fichiers), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const modifierProduit = (id, valeurs, fichiers) =>
  api.put(VENDEUR.MODIF_PRODUIT(id), toFormData(valeurs, fichiers), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const supprimerProduit  = (id) => api.delete(VENDEUR.SUPPR_PRODUIT(id));
export const dupliquerProduit  = (id) => api.post(VENDEUR.DUPLIQUER(id));
export const basculerDisponibilite = (id, disponible) =>
  api.patch(VENDEUR.DISPONIBILITE(id), { disponible });

// ── Boutique ────────────────────────────────────────────────────────────────
export const getMaBoutique = () => api.get(VENDEUR.MA_BOUTIQUE);

export const modifierBoutique = (valeurs, logo) => {
  const form = new FormData();
  Object.entries(valeurs).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== null) form.append(cle, valeur);
  });
  if (logo) form.append('logo', logo);
  return api.put(VENDEUR.MODIFIER_BOUTIQUE, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const mettreBoutiqueEnPause = () => api.patch(VENDEUR.BOUTIQUE_PAUSE);
export const reactiverBoutique     = () => api.patch(VENDEUR.BOUTIQUE_REACTIVER);

// ── Vitrine : le site web public de la boutique ─────────────────────────────
// Réglages seulement. Le logo et la bannière restent gérés par la page
// Boutique : ce sont des informations de la boutique, pas du site.
export const getMaVitrine    = () => api.get(VENDEUR.MA_VITRINE);
export const modifierVitrine = (payload) => api.put(VENDEUR.MA_VITRINE, payload);

// ── Abonnement ──────────────────────────────────────────────────────────────
export const getMonAbonnement       = () => api.get(VENDEUR.MON_ABONNEMENT);
export const initierRenouvellement  = (payload) => api.post(VENDEUR.RENOUVELER, payload);
export const getHistoriquePaiements = () => api.get(VENDEUR.HISTORIQUE_PAIEMENTS);

// ── Commandes reçues ────────────────────────────────────────────────────────
export const getCommandes      = () => api.get(COMMANDES_VENDEUR.LIST);
export const getCommande       = (id) => api.get(COMMANDES_VENDEUR.DETAIL(id));
export const changerStatutCommande = (id, statut) =>
  api.patch(COMMANDES_VENDEUR.STATUT(id), { statut });

// ── Promotions ──────────────────────────────────────────────────────────────
export const getPromotions      = () => api.get(PROMOTIONS.LIST);
export const creerPromotion     = (payload) => api.post(PROMOTIONS.CREATE, payload);
export const modifierPromotion  = (id, payload) => api.put(PROMOTIONS.UPDATE(id), payload);
export const supprimerPromotion = (id) => api.delete(PROMOTIONS.DELETE(id));

// ── Conversations ───────────────────────────────────────────────────────────
export const getConversations = () => api.get(VENDEUR.CONVERSATIONS);

// ── Vérification du profil ──────────────────────────────────────────────────
export const getStatutVerification = () => api.get(VENDEUR.STATUT_VERIFICATION);

export const soumettreVerification = (piece, typePiece) => {
  const form = new FormData();
  form.append('piece', piece);
  if (typePiece) form.append('typePiece', typePiece);
  return api.post(VENDEUR.SOUMETTRE_VERIFICATION, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
