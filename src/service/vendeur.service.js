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
export const getProduits    = (params) => api.get(VENDEUR.PRODUITS, { params });
export const rechercherProduits = (q) => api.get(VENDEUR.RECHERCHE, { params: { q } });

/** Huit fichiers au plus par envoi : c'est la limite posée par le backend. */
export const MAX_IMAGES_SUPPLEMENTAIRES = 8;

/** Cinq mégaoctets par fichier, limite du backend elle aussi. */
export const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;

const ENTETES_MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

/**
 * Création / modification : le backend attend du multipart, on envoie donc un
 * FormData même lorsqu'aucun fichier n'est joint.
 *
 * Une seule photo part avec le produit. Les deux routes sont déclarées
 * `upload.single('image')` : tout autre champ de fichier fait rejeter la
 * requête entière, et le produit n'est pas créé du tout. Les photos
 * supplémentaires ont leur propre adresse, `POST /vendeur/produit/:id/images`,
 * qui prend le champ « images » — c'est aussi ce que fait l'application
 * mobile.
 */
function toFormData(valeurs, fichiers = {}) {
  const form = new FormData();
  Object.entries(valeurs).forEach(([cle, valeur]) => {
    if (valeur === undefined || valeur === null || valeur === '') return;
    // Objets et tableaux (caractéristiques du produit) partent en JSON :
    // un FormData n'accepte que du texte et des fichiers.
    form.append(cle, typeof valeur === 'object' ? JSON.stringify(valeur) : valeur);
  });
  if (fichiers.image) form.append('image', fichiers.image);
  return form;
}

/** Ajoute des photos à un produit existant. Les envoie toutes en une requête. */
export const envoyerImagesProduit = (id, images = []) => {
  const form = new FormData();
  images.slice(0, MAX_IMAGES_SUPPLEMENTAIRES).forEach((f) => form.append('images', f));
  return api.post(VENDEUR.IMAGES(id), form, ENTETES_MULTIPART);
};

/**
 * Second temps de l'enregistrement. Un échec ici ne doit pas faire passer le
 * produit pour non enregistré : il l'est, il lui manque des photos. On rend
 * donc l'erreur à l'appelant au lieu de la lever, à lui de le dire.
 */
async function joindreImages(id, images) {
  if (!id || !images?.length) return null;
  try {
    await envoyerImagesProduit(id, images);
    return null;
  } catch (err) {
    return err;
  }
}

export const creerProduit = async (valeurs, fichiers = {}) => {
  const reponse = await api.post(
    VENDEUR.AJOUT_PRODUIT,
    toFormData(valeurs, fichiers),
    ENTETES_MULTIPART,
  );
  const produit = reponse?.data?.produit;
  return { produit, erreurImages: await joindreImages(produit?.id, fichiers.images) };
};

export const modifierProduit = async (id, valeurs, fichiers = {}) => {
  const reponse = await api.put(
    VENDEUR.MODIF_PRODUIT(id),
    toFormData(valeurs, fichiers),
    ENTETES_MULTIPART,
  );
  return {
    produit: reponse?.data?.produit,
    erreurImages: await joindreImages(id, fichiers.images),
  };
};

export const supprimerProduit  = (id) => api.delete(VENDEUR.SUPPR_PRODUIT(id));
export const dupliquerProduit  = (id) => api.post(VENDEUR.DUPLIQUER(id));
export const basculerDisponibilite = (id, disponible) =>
  api.patch(VENDEUR.DISPONIBILITE(id), { disponible });

// ── Boutique ────────────────────────────────────────────────────────────────
export const getMaBoutique = () => api.get(VENDEUR.MA_BOUTIQUE);

export const modifierBoutique = (valeurs, logo) => {
  const form = new FormData();
  Object.entries(valeurs).forEach(([cle, valeur]) => {
    if (valeur === undefined || valeur === null) return;
    form.append(cle, typeof valeur === 'object' ? JSON.stringify(valeur) : valeur);
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
// Supprime le site (présence en ligne) ; les produits restent.
export const supprimerVitrine = () => api.delete(VENDEUR.MA_VITRINE);
// Aperçu du site, publié ou non.
export const getApercuVitrine = () => api.get(VENDEUR.MA_VITRINE_APERCU);

// Photos du haut du site : enregistrées dès l'envoi, hors du brouillon des
// réglages. Chaque réponse renvoie la vitrine à jour, liste des photos comprise.
export const ajouterPhotosVitrine = (fichiers) => {
  const form = new FormData();
  fichiers.forEach((f) => form.append('photos', f));
  return api.post(VENDEUR.MA_VITRINE_PHOTOS, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Plusieurs photos sur une connexion mobile : on laisse le temps.
    timeout: 120000,
  });
};
export const ordonnerPhotosVitrine = (ids) => api.put(VENDEUR.MA_VITRINE_PHOTOS_ORDRE, { ids });
export const supprimerPhotoVitrine = (id) => api.delete(VENDEUR.MA_VITRINE_PHOTO(id));

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

// ── Messages reçus via la page Contact du site ──────────────────────────────
export const getMessagesSite = () => api.get(VENDEUR.MESSAGES_SITE);
export const marquerMessageSiteLu = (id) => api.put(VENDEUR.MESSAGE_SITE_LU(id));
export const supprimerMessageSite = (id) => api.delete(VENDEUR.MESSAGE_SITE(id));

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
