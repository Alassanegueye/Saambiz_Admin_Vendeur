import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from '../../utils/alert';
import {
  getMaBoutique,
  creerBoutique,
  modifierBoutique,
  mettreBoutiqueEnPause,
  reactiverBoutique,
  getStatutVerification,
  soumettreVerification,
} from '../../service/vendeur.service';
import useCategories from '../../hooks/useCategories';
import { egal } from './outilsSite';

/** Une boutique se range dans 1 à 3 catégories ; la première est la principale. */
export const MAX_CATEGORIES = 3;

/**
 * Contrôleur des infos de la boutique (la fenêtre « Infos de la boutique »).
 *
 * Trois sujets indépendants cohabitent : les informations de la boutique, sa
 * mise en pause, et la vérification du profil. Ils sont chargés séparément
 * parce qu'ils échouent séparément — un profil non soumis ne doit pas
 * empêcher de modifier le nom de la boutique.
 */

export const CHAMPS_VIDES = {
  nom: '',
  description: '',
  localisation: '',
  telephone: '',
  categories: [],
  slogan: '',
};

/** Libellés et couleurs des états de vérification, côté vendeur. */
export const ETATS_VERIFICATION = {
  approuve:   { label: 'Profil vérifié',    variant: 'success' },
  en_attente: { label: 'En cours d’examen', variant: 'warning' },
  rejete:     { label: 'Refusé',            variant: 'danger' },
  non_soumis: { label: 'Non vérifié',       variant: 'default' },
};

/** Les infos de la boutique dans la forme du formulaire. */
function valeursDe(b) {
  if (!b) return CHAMPS_VIDES;
  return {
    nom: b.nom || '',
    description: b.description || '',
    localisation: b.localisation || '',
    telephone: b.telephone || b.whatsapp || '',
    // Slugs, principale en premier. Une boutique d'avant la refonte n'a
    // que son ancien libellé : le backend sait le traduire.
    categories: Array.isArray(b.categories) && b.categories.length
      ? b.categories.map((c) => c.slug || c.id)
      : (b.categorie ? [b.categorie] : []),
    slogan: b.slogan || '',
  };
}

export default function useBoutique() {
  const [boutique, setBoutique] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  // Une panne (et non un simple « pas encore de boutique ») : la page ne
  // doit pas proposer de créer une boutique qui existe peut-être déjà.
  const [erreurChargement, setErreurChargement] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const { categories, etat: etatCategories, recharger: rechargerCategories } = useCategories();
  const [pauseEnCours, setPauseEnCours] = useState(false);

  // Vérification du profil — indépendante de la boutique elle-même.
  const [verif, setVerif] = useState(null);
  const [piece, setPiece] = useState(null);
  const [typePiece, setTypePiece] = useState('CNI');
  const [envoiVerif, setEnvoiVerif] = useState(false);

  // Seul le premier chargement montre l'attente : relire la boutique après
  // un enregistrement ou une pause ne doit pas faire clignoter la page.
  const charger = useCallback(async () => {
    try {
      const res = await getMaBoutique();
      const b = res.data?.boutique || res.data?.data?.boutique || null;
      setBoutique(b);
      setValeurs(valeursDe(b));
      setErreurChargement(false);
    } catch (err) {
      // 404 = pas encore de boutique : c'est un état normal pour un vendeur
      // qui vient de s'inscrire, pas une erreur à lui signaler.
      const panne = err?.response?.status !== 404;
      if (panne) toast.error('Erreur lors du chargement de la boutique');
      setErreurChargement(panne);
      setBoutique(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const chargerVerification = useCallback(() => {
    getStatutVerification()
      .then((res) => setVerif(res.data?.verification || null))
      // Sans réponse, on affiche la section comme « non soumis » : mieux vaut
      // proposer l'envoi que masquer la fonctionnalité.
      .catch(() => setVerif(null));
  }, []);

  useEffect(() => { chargerVerification(); }, [chargerVerification]);

  /**
   * La pause n'est pas un état rangé côté serveur : elle rend tous les
   * produits indisponibles, la réactivation les rend tous disponibles. Une
   * boutique dont aucun produit n'est disponible est donc en pause — c'est
   * exactement ce que voient ses clients.
   */
  const produits = useMemo(() => boutique?.produits || [], [boutique]);
  const enPause = produits.length > 0 && produits.every((p) => p.disponible === false);

  /** Quelque chose a-t-il changé dans le formulaire depuis le dernier enregistrement ? */
  const modifie = Boolean(logo) || !egal(valeurs, valeursDe(boutique));

  /** Abandonner la saisie : le formulaire revient aux infos enregistrées. */
  const annulerModifs = () => {
    setValeurs(valeursDe(boutique));
    setLogo(null);
    setErreurs({});
  };

  /** @returns true si les infos sont enregistrées (ou la boutique créée). */
  const enregistrer = async () => {
    const e = {};
    if (!valeurs.nom.trim()) e.nom = 'Le nom est requis.';
    else if (!/^\p{L}/u.test(valeurs.nom.trim())) e.nom = 'Le nom de la boutique doit commencer par une lettre.';
    if (!valeurs.categories.length) e.categories = 'Choisissez au moins une catégorie.';
    setErreurs(e);
    if (Object.keys(e).length > 0) return false;

    setSaving(true);
    try {
      if (boutique) {
        await modifierBoutique(valeurs, logo);
        toast.success('Infos de la boutique enregistrées');
      } else {
        await creerBoutique(valeurs, logo);
        toast.success('Votre boutique est créée ! Composez maintenant votre site.');
      }
      setLogo(null);
      await charger();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'enregistrement");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const basculerPause = async () => {
    setPauseEnCours(true);
    try {
      if (enPause) {
        await reactiverBoutique();
        toast.success('Boutique réactivée — vos produits sont de nouveau disponibles');
      } else {
        await mettreBoutiqueEnPause();
        toast.success('Boutique en pause — vos produits sont indisponibles');
      }
      await charger();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement d’état');
      return false;
    } finally {
      setPauseEnCours(false);
    }
  };

  const envoyerVerification = async () => {
    if (!piece) {
      toast.error('Choisissez la photo de la pièce à transmettre.');
      return;
    }
    setEnvoiVerif(true);
    try {
      const res = await soumettreVerification(piece, typePiece);
      toast.success(res.data?.message || 'Demande envoyée');
      setPiece(null);
      chargerVerification();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setEnvoiVerif(false);
    }
  };

  return {
    boutique, loading, erreurChargement, charger,
    valeurs, setValeurs, erreurs, saving, logo, setLogo, enregistrer, modifie, annulerModifs,
    categories, etatCategories, rechargerCategories,
    produits, enPause, pauseEnCours, basculerPause,
    verif, piece, setPiece, typePiece, setTypePiece, envoiVerif, envoyerVerification,
  };
}
