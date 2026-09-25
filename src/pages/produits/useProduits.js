import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  getProduits,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  dupliquerProduit,
  basculerDisponibilite,
} from '../../service/vendeur.service';
import { getCategories } from '../../service/categories.service';
import useDebounce from '../../hooks/useDebounce';

/**
 * Contrôleur de la page Produits.
 *
 * Tout ce qui n'est pas de l'affichage vit ici : chargement, recherche,
 * pagination, formulaire, mutations. La page n'en reçoit qu'un objet et se
 * contente de le rendre.
 *
 * L'intérêt n'est pas cosmétique : cette logique devient testable sans monter
 * le moindre composant, et la page redevient lisible d'un seul regard — elle
 * faisait 400 lignes où l'on ne distinguait plus la structure du contenu.
 */

const PAGE_SIZE = 10;

export const CHAMPS_VIDES = {
  nom: '',
  description: '',
  prix: '',
  quantite: '',
  categorieId: '',
};

export default function useProduits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rechercheDifferee = useDebounce(search, 300);

  // `edition` porte trois états : null = modale fermée, {} = création,
  // un produit = modification. Un seul champ plutôt que deux booléens qui
  // finiraient par se contredire.
  const [edition, setEdition] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [erreurs, setErreurs] = useState({});

  const [suppression, setSuppression] = useState(null);

  // ── Chargement ─────────────────────────────────────────────────────────────
  const charger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const res = await getProduits();
      const liste = res.data?.produits || res.data?.data || res.data || [];
      setProduits(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement de vos produits');
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { charger({ initial: true }); }, [charger]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const liste = res.data?.categories || res.data?.data || res.data || [];
        setCategories(Array.isArray(liste) ? liste : []);
      })
      // Les catégories ne sont pas bloquantes : le champ reste libre.
      .catch(() => setCategories([]));
  }, []);

  // ── Recherche et pagination ────────────────────────────────────────────────
  const filtres = useMemo(() => {
    const s = rechercheDifferee.toLowerCase();
    if (!s) return produits;
    return produits.filter(
      (p) => (p.nom || '').toLowerCase().includes(s)
        || (p.description || '').toLowerCase().includes(s)
    );
  }, [produits, rechercheDifferee]);

  const totalPages = Math.ceil(filtres.length / PAGE_SIZE);
  const pageCourante = filtres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rechercher = (valeur) => {
    setSearch(valeur);
    // Rester en page 4 après une recherche qui ne rend que 2 résultats
    // afficherait une liste vide sans raison apparente.
    setPage(1);
  };

  // ── Formulaire ─────────────────────────────────────────────────────────────
  const reinitialiserFormulaire = () => {
    setImage(null);
    setImages([]);
    setErreurs({});
  };

  const ouvrirCreation = () => {
    setValeurs(CHAMPS_VIDES);
    reinitialiserFormulaire();
    setEdition({});
  };

  const ouvrirEdition = (produit) => {
    setValeurs({
      nom: produit.nom || '',
      description: produit.description || '',
      prix: produit.prix ?? '',
      quantite: produit.quantite ?? '',
      categorieId: produit.categorieId || produit.categorie?.id || '',
    });
    reinitialiserFormulaire();
    setEdition(produit);
  };

  const fermer = () => setEdition(null);

  const valider = () => {
    const e = {};
    if (!valeurs.nom.trim()) e.nom = 'Le nom est requis.';
    if (valeurs.prix === '' || Number(valeurs.prix) <= 0) {
      e.prix = 'Indiquez un prix supérieur à 0.';
    }
    if (valeurs.quantite !== '' && Number(valeurs.quantite) < 0) {
      e.quantite = 'Quantité invalide.';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setSaving(true);
    const estCreation = !edition?.id;
    try {
      if (estCreation) {
        await creerProduit(valeurs, { image, images });
        toast.success('Produit publié');
      } else {
        await modifierProduit(edition.id, valeurs, { image, images });
        toast.success('Produit mis à jour');
      }
      fermer();
      await charger();
    } catch (err) {
      // Le backend refuse la publication si l'abonnement est échu : on relaie
      // son message plutôt qu'une erreur générique.
      toast.error(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  // ── Actions de ligne ───────────────────────────────────────────────────────
  const basculer = async (produit) => {
    const cible = !(produit.disponible ?? true);
    try {
      await basculerDisponibilite(produit.id, cible);
      toast.success(cible ? 'Produit remis en vente' : 'Produit retiré de la vente');
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement de disponibilité');
    }
  };

  const dupliquer = async (produit) => {
    try {
      await dupliquerProduit(produit.id);
      toast.success(`« ${produit.nom} » dupliqué`);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la duplication');
    }
  };

  const confirmerSuppression = async () => {
    if (!suppression) return;
    try {
      await supprimerProduit(suppression.id);
      toast.success('Produit supprimé');
      setSuppression(null);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return {
    // Données
    produits, categories, loading,
    pageCourante, page, totalPages, setPage,
    search, rechercher, rechercheDifferee,

    // Formulaire
    edition, valeurs, setValeurs, erreurs, saving,
    image, setImage, images, setImages,
    ouvrirCreation, ouvrirEdition, fermer, enregistrer,

    // Actions
    basculer, dupliquer,
    suppression, setSuppression, confirmerSuppression,
  };
}
