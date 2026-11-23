import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '../../utils/alert';
import {
  getProduits,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  dupliquerProduit,
  basculerDisponibilite,
  MAX_IMAGES_SUPPLEMENTAIRES,
  TAILLE_MAX_IMAGE,
} from '../../service/vendeur.service';
import { getCategories } from '../../service/categories.service';
import useDebounce from '../../hooks/useDebounce';
import { verifierSpecifications } from '../../components/forms/verifierSpecifications';
import { visiblePourLesClients, enModeration } from './statutProduit';

/**
 * Contrôleur de la page Produits.
 *
 * Tout ce qui n'est pas de l'affichage vit ici : chargement, recherche,
 * pagination, formulaire, mutations. La page n'en reçoit qu'un objet et se
 * contente de le rendre.
 *
 * L'intérêt n'est pas cosmétique : cette logique est testable sans monter
 * le moindre composant, et la page se lit d'un seul regard.
 */

const PAGE_SIZE = 10;

export const CHAMPS_VIDES = {
  nom: '',
  description: '',
  prix: '',
  quantite: '',
  categorieId: '',
  // Caractéristiques propres à la catégorie : { tailles: [...], etat: 'Neuf' }
  attributs: {},
};

/** Filtres en pastilles au-dessus de la liste. */
export const FILTRES_PRODUITS = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'en_vente', libelle: 'En vente' },
  { valeur: 'rupture', libelle: 'Rupture de stock' },
  { valeur: 'retires', libelle: 'Retirés de la vente' },
  { valeur: 'moderation', libelle: 'En attente ou refusés' },
];

// « En vente » veut dire vu par les clients : un produit refusé par la
// modération ne l'est pas, même disponible et en stock.
const enVente = visiblePourLesClients;
const enRupture = (p) => !enModeration(p) && (p.disponible ?? true) && Number(p.quantite ?? 1) <= 0;
const retire = (p) => !enModeration(p) && p.disponible === false;
const TESTS = {
  en_vente: enVente, rupture: enRupture, retires: retire, moderation: enModeration,
};

export default function useProduits() {
  // ?filtre=rupture : ouverture depuis l'accueil ; ?nouveau=1 : le bouton
  // « Ajouter un produit » de l'accueil ouvre directement le formulaire.
  const [params, setParams] = useSearchParams();
  const filtre = TESTS[params.get('filtre')] ? params.get('filtre') : '';

  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rechercheDifferee = useDebounce(search, 300);

  // `edition` porte trois états : null = modale fermée, {} = création,
  // un produit = modification. Un seul champ plutôt que deux booléens qui
  // finiraient par se contredire.
  const [edition, setEdition] = useState(() => (params.get('nouveau') ? {} : null));
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
    return produits.filter((p) => {
      if (filtre && !TESTS[filtre](p)) return false;
      if (!s) return true;
      return (p.nom || '').toLowerCase().includes(s)
        || (p.description || '').toLowerCase().includes(s);
    });
  }, [produits, rechercheDifferee, filtre]);

  const compteurs = {
    '': produits.length,
    en_vente: produits.filter(enVente).length,
    rupture: produits.filter(enRupture).length,
    retires: produits.filter(retire).length,
    moderation: produits.filter(enModeration).length,
  };

  const choisirFiltre = (valeur) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set('filtre', valeur); else suivants.delete('filtre');
    setParams(suivants, { replace: true });
    setPage(1);
  };

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
      attributs: produit.attributs || {},
    });
    reinitialiserFormulaire();
    setEdition(produit);
  };

  const fermer = () => {
    setEdition(null);
    // Venu de l'accueil (?nouveau=1) : on retire le paramètre, sinon un
    // rechargement rouvrirait le formulaire.
    if (params.get('nouveau')) {
      const suivants = new URLSearchParams(params);
      suivants.delete('nouveau');
      setParams(suivants, { replace: true });
    }
  };

  const valider = () => {
    const e = {};
    if (!valeurs.nom.trim()) e.nom = 'Le nom est requis.';
    if (valeurs.prix === '' || Number(valeurs.prix) <= 0) {
      e.prix = 'Indiquez un prix supérieur à 0.';
    }
    if (valeurs.quantite !== '' && Number(valeurs.quantite) < 0) {
      e.quantite = 'Quantité invalide.';
    }
    if (categories.length && !valeurs.categorieId) e.categorieId = 'Choisissez une catégorie.';
    const specs = categories.find((c) => c.id === valeurs.categorieId)?.specifications || [];
    const erreursSpecs = verifierSpecifications(specs, valeurs.attributs);
    if (Object.keys(erreursSpecs).length) e.attributs = erreursSpecs;
    // Les deux limites du backend, dites ici plutôt que subies là-bas : refusée
    // par le serveur, la requête ne rend qu'un « 413 » que personne ne sait lire.
    if (images.length > MAX_IMAGES_SUPPLEMENTAIRES) {
      e.images = `${MAX_IMAGES_SUPPLEMENTAIRES} photos supplémentaires au maximum (${images.length} choisies).`;
    } else {
      const tropLourde = [image, ...images].find((f) => f && f.size > TAILLE_MAX_IMAGE);
      if (tropLourde) e.images = `« ${tropLourde.name} » dépasse 5 Mo.`;
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setSaving(true);
    const estCreation = !edition?.id;
    try {
      const { erreurImages } = estCreation
        ? await creerProduit(valeurs, { image, images })
        : await modifierProduit(edition.id, valeurs, { image, images });

      // Le produit est enregistré ; seules les photos supplémentaires ont
      // échoué. Le dire tel quel : « erreur » tout court ferait recommencer
      // la saisie et créerait un doublon.
      if (erreurImages) {
        toast.error(
          `${estCreation ? 'Produit publié' : 'Produit mis à jour'}, mais les photos supplémentaires n'ont pas été envoyées : `
          + `${erreurImages?.response?.data?.message || 'réessayez depuis la fiche du produit.'}`,
        );
      } else {
        toast.success(estCreation ? 'Produit publié' : 'Produit mis à jour');
      }
      fermer();
      await charger();
    } catch (err) {
      // Le backend refuse la publication si l'abonnement est échu : on relaie
      // son message plutôt qu'une erreur générique.
      // 422 : le backend précise champ par champ ce qui manque.
      const details = err?.response?.data?.details || err?.response?.data?.errors;
      if (Array.isArray(details) && details.length) {
        setErreurs((prec) => ({
          ...prec,
          attributs: Object.fromEntries(details.filter((d) => d.champ).map((d) => [d.champ, d.message])),
        }));
      }
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
    filtre, choisirFiltre, compteurs,

    // Formulaire
    edition, valeurs, setValeurs, erreurs, saving,
    image, setImage, images, setImages,
    ouvrirCreation, ouvrirEdition, fermer, enregistrer,

    // Actions
    basculer, dupliquer,
    suppression, setSuppression, confirmerSuppression,
  };
}
