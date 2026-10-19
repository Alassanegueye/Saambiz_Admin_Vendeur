import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getMaBoutique,
  modifierBoutique,
  mettreBoutiqueEnPause,
  reactiverBoutique,
  getStatutVerification,
  soumettreVerification,
} from '../../service/vendeur.service';
import { getCategories } from '../../service/categories.service';

/** Une boutique se range dans 1 à 3 catégories ; la première est la principale. */
export const MAX_CATEGORIES = 3;

/**
 * Contrôleur de la page Boutique.
 *
 * Trois sujets indépendants cohabitent sur cet écran : les informations de la
 * vitrine, sa mise en pause, et la vérification du profil. Ils sont chargés
 * séparément parce qu'ils échouent séparément — un profil non soumis ne doit
 * pas empêcher de modifier le nom de la boutique.
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

export default function useBoutique() {
  const [boutique, setBoutique] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [categories, setCategories] = useState([]);
  const [confirmPause, setConfirmPause] = useState(false);

  // Vérification du profil — indépendante de la boutique elle-même.
  const [verif, setVerif] = useState(null);
  const [piece, setPiece] = useState(null);
  const [typePiece, setTypePiece] = useState('CNI');
  const [envoiVerif, setEnvoiVerif] = useState(false);

  const charger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const res = await getMaBoutique();
      const b = res.data?.boutique || res.data?.data || res.data || null;
      setBoutique(b);
      if (b) {
        setValeurs({
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
        });
      }
    } catch (err) {
      // 404 = pas encore de boutique : c'est un état normal pour un vendeur
      // qui vient de s'inscrire, pas une erreur à lui signaler.
      if (err?.response?.status !== 404) {
        toast.error('Erreur lors du chargement de la boutique');
      }
      setBoutique(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { charger({ initial: true }); }, [charger]);

  const chargerVerification = useCallback(() => {
    getStatutVerification()
      .then((res) => setVerif(res.data?.verification || null))
      // Sans réponse, on affiche la section comme « non soumis » : mieux vaut
      // proposer l'envoi que masquer la fonctionnalité.
      .catch(() => setVerif(null));
  }, []);

  useEffect(() => { chargerVerification(); }, [chargerVerification]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const liste = res.data?.categories || res.data?.data || res.data || [];
        setCategories(Array.isArray(liste) ? liste : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const enregistrer = async () => {
    const e = {};
    if (!valeurs.nom.trim()) e.nom = 'Le nom est requis.';
    if (!valeurs.categories.length) e.categories = 'Choisissez au moins une catégorie.';
    setErreurs(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await modifierBoutique(valeurs, logo);
      toast.success('Boutique mise à jour');
      setLogo(null);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const basculerPause = async () => {
    try {
      if (boutique?.enPause) {
        await reactiverBoutique();
        toast.success('Boutique réactivée — vos produits sont de nouveau visibles');
      } else {
        await mettreBoutiqueEnPause();
        toast.success('Boutique mise en pause — vos produits sont masqués');
      }
      setConfirmPause(false);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement d’état');
    }
  };

  const envoyerVerification = async () => {
    if (!piece) {
      toast.error('Choisissez la pièce à transmettre.');
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
    boutique, loading,
    valeurs, setValeurs, erreurs, saving, logo, setLogo, enregistrer, categories,
    confirmPause, setConfirmPause, basculerPause,
    verif, piece, setPiece, typePiece, setTypePiece, envoiVerif, envoyerVerification,
  };
}
