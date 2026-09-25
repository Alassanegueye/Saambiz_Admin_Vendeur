import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getPromotions,
  creerPromotion,
  modifierPromotion,
  supprimerPromotion,
  getProduits,
} from '../../service/vendeur.service';
import { formatMontant } from '../../utils/formatters';

/**
 * Contrôleur de la page Promotions.
 *
 * Une promotion porte toujours sur un produit précis : la page charge donc les
 * deux listes en parallèle, et sait rester utilisable quand le catalogue est
 * vide — c'est le cas d'un vendeur qui vient d'ouvrir.
 */

export const CHAMPS_VIDES = {
  titre: '',
  description: '',
  prixPromo: '',
  dateDebut: '',
  dateFin: '',
  produitId: '',
};

/** L'input date HTML attend AAAA-MM-JJ. */
const versInputDate = (valeur) => {
  if (!valeur) return '';
  const d = new Date(valeur);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

/** Une promotion est en cours si elle est active et que la date du jour tombe dedans. */
export const estEnCours = (promo) => {
  const maintenant = new Date();
  return promo.active !== false
    && new Date(promo.dateDebut) <= maintenant
    && new Date(promo.dateFin) >= maintenant;
};

export default function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [edition, setEdition] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [erreurs, setErreurs] = useState({});
  const [saving, setSaving] = useState(false);
  const [suppression, setSuppression] = useState(null);

  const charger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      // En parallèle : la page a besoin des deux pour être utilisable, les
      // enchaîner doublerait l'attente sur un réseau lent.
      const [resPromos, resProduits] = await Promise.all([getPromotions(), getProduits()]);
      const promos = resPromos.data?.promotions || resPromos.data?.data || resPromos.data || [];
      const prods = resProduits.data?.produits || resProduits.data?.data || resProduits.data || [];
      setPromotions(Array.isArray(promos) ? promos : []);
      setProduits(Array.isArray(prods) ? prods : []);
    } catch {
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { charger({ initial: true }); }, [charger]);

  const ouvrirCreation = () => {
    setValeurs(CHAMPS_VIDES);
    setErreurs({});
    setEdition({});
  };

  const ouvrirEdition = (promo) => {
    setValeurs({
      titre: promo.titre || '',
      description: promo.description || '',
      prixPromo: promo.prixPromo ?? '',
      dateDebut: versInputDate(promo.dateDebut),
      dateFin: versInputDate(promo.dateFin),
      produitId: promo.produitId || promo.produit?.id || '',
    });
    setErreurs({});
    setEdition(promo);
  };

  const fermer = () => setEdition(null);

  const valider = () => {
    const e = {};
    if (!valeurs.titre.trim()) e.titre = 'Le titre est requis.';
    if (!valeurs.produitId) e.produitId = 'Choisissez le produit concerné.';
    if (valeurs.prixPromo === '' || Number(valeurs.prixPromo) <= 0) {
      e.prixPromo = 'Indiquez le prix promotionnel.';
    }
    if (!valeurs.dateDebut) e.dateDebut = 'Date de début requise.';
    if (!valeurs.dateFin) e.dateFin = 'Date de fin requise.';
    if (valeurs.dateDebut && valeurs.dateFin && valeurs.dateFin < valeurs.dateDebut) {
      e.dateFin = 'La fin doit suivre le début.';
    }

    // Une promo plus chère que le produit n'a pas de sens : on le dit avant
    // l'aller-retour serveur.
    const produit = produits.find((p) => String(p.id) === String(valeurs.produitId));
    if (produit && Number(valeurs.prixPromo) >= Number(produit.prix)) {
      e.prixPromo = `Doit être inférieur au prix actuel (${formatMontant(produit.prix)}).`;
    }

    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setSaving(true);
    try {
      if (edition?.id) {
        await modifierPromotion(edition.id, valeurs);
        toast.success('Promotion mise à jour');
      } else {
        await creerPromotion(valeurs);
        toast.success('Promotion créée');
      }
      fermer();
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const confirmerSuppression = async () => {
    if (!suppression) return;
    try {
      await supprimerPromotion(suppression.id);
      toast.success('Promotion supprimée');
      setSuppression(null);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return {
    promotions, produits, loading,
    edition, valeurs, setValeurs, erreurs, saving,
    ouvrirCreation, ouvrirEdition, fermer, enregistrer,
    suppression, setSuppression, confirmerSuppression,
  };
}
