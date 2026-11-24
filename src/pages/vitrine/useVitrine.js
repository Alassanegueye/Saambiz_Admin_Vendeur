import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, showConfirm } from '../../utils/alert';
import {
  getMaVitrine, modifierVitrine, supprimerVitrine, getApercuVitrine,
  ajouterPhotosVitrine, ordonnerPhotosVitrine, supprimerPhotoVitrine,
} from '../../service/vendeur.service';
import { messageErreur } from './messageErreur';
import { completerLien, egal } from '../boutique/outilsSite';

/**
 * Contrôleur du site de la boutique, sur la page « Ma boutique ».
 *
 * Le vendeur ne choisit pas un site entier parmi des maquettes : il règle un
 * moteur unique. Trois mises en page, une couleur d'accent, des sections
 * qu'on remplit de produits. Une seule base de code à tenir pour toutes les
 * boutiques, et un commerçant qui gère la sienne depuis son téléphone n'a
 * pas à comparer des modèles pour ouvrir son site.
 *
 * Le formulaire est tenu localement et n'est envoyé qu'à l'enregistrement :
 * une sauvegarde à chaque frappe multiplierait les requêtes sur une connexion
 * mobile, et rendrait impossible d'abandonner une modification. `serveur`
 * garde ce qui est enregistré : la différence avec `valeurs` est ce qu'il
 * reste à enregistrer (`modifie`), et « Annuler » y revient.
 */

/** Les trois mises en page, avec ce à quoi chacune convient. */
export const MODELES = [
  {
    cle: 'classique',
    nom: 'Classique',
    resume: 'Des cartes produits équilibrées.',
    pourQui: 'Le choix sûr, quel que soit ce que vous vendez.',
  },
  {
    cle: 'galerie',
    nom: 'Galerie',
    resume: 'Des cartes avec de grandes photos.',
    pourQui: 'Mode, décoration, bijoux — tout ce qui se vend par la photo.',
  },
  {
    cle: 'catalogue',
    nom: 'Catalogue',
    resume: 'Une liste compacte, rapide à parcourir.',
    pourQui: 'Gros stocks, pièces détachées, produits qui se comparent.',
  },
];

/**
 * Palette proposée.
 *
 * Six couleurs qui fonctionnent toutes sur le site, plus le choix libre. Le
 * site en dérive le reste — texte sur les boutons, voiles, bordures — et
 * reste donc lisible même avec un jaune vif. Proposer des couleurs évite au
 * vendeur d'ouvrir un sélecteur pour finir sur un gris.
 */
export const COULEURS = [
  { valeur: '#0D1B3D', nom: 'Bleu marine' },
  { valeur: '#F2B705', nom: 'Or' },
  { valeur: '#1B7F4F', nom: 'Vert' },
  { valeur: '#B3261E', nom: 'Rouge' },
  { valeur: '#6B4EFF', nom: 'Violet' },
  { valeur: '#14181F', nom: 'Noir' },
];

const SECTIONS_PAR_DEFAUT = { apropos: true, categories: true, avis: true, contact: true, nouveautes: true, meilleures: true };

/** Le serveur refuse les fichiers de plus de 5 Mo. */
const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;

/** Le corps de réponse peut arriver sous `data` ou nu selon l'ancienneté de la route. */
const extraire = (reponse) => reponse?.data?.data ?? reponse?.data ?? null;

/** Les réglages du serveur, mis dans la forme exacte du formulaire. */
function normaliser(v = {}) {
  return {
    slug: v.slug || '',
    active: v.active !== false,
    modele: v.modele || 'classique',
    accent: v.accent || '#0D1B3D',
    apropos: v.apropos || '',
    annonce: v.annonce || '',
    horaires: v.horaires || '',
    reseaux: {
      facebook: v.reseaux?.facebook || '',
      instagram: v.reseaux?.instagram || '',
      snapchat: v.reseaux?.snapchat || '',
      tiktok: v.reseaux?.tiktok || '',
      site: v.reseaux?.site || '',
    },
    sections: { ...SECTIONS_PAR_DEFAUT, ...(v.sections || {}) },
    commande: v.commande !== false,
    paiementLivraison: v.paiementLivraison !== false,
    sectionsPerso: (Array.isArray(v.sectionsPerso) ? v.sectionsPerso : []).map((s) => ({
      id: s.id,
      titre: s.titre || '',
      produitIds: Array.isArray(s.produitIds) ? s.produitIds : [],
    })),
    blocs: {
      icones: v.blocs?.icones || {},
      avantages: (v.blocs?.avantages || []).map((a) => ({ icone: a.icone, titre: a.titre || '', texte: a.texte || '' })),
    },
  };
}

/**
 * Le brouillon tel qu'il part : liens de réseaux complétés (https://…), et
 * l'adresse seulement si le vendeur l'a changée. Une adresse fabriquée par
 * le serveur à la création peut ne pas suivre la règle de saisie (« bo »
 * pour la boutique « Bo ») : la renvoyer telle quelle faisait refuser tout
 * l'enregistrement, pour une adresse que le vendeur n'avait pas touchée.
 */
function aEnvoyer(valeurs, slugEnregistre) {
  const reseaux = Object.fromEntries(
    Object.entries(valeurs.reseaux).map(([cle, lien]) => [cle, completerLien(cle, lien)]),
  );
  const { slug, ...reste } = valeurs;
  return slug === slugEnregistre ? { ...reste, reseaux } : { ...reste, slug, reseaux };
}

export default function useVitrine() {
  const [donnees, setDonnees] = useState(null);
  const [valeurs, setValeurs] = useState(() => normaliser());
  const [serveur, setServeur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState(null);
  // Données de la boutique pour l'aperçu en direct (catalogue compris).
  const [version, setVersion] = useState(0);
  const [apercu, setApercu] = useState(null);

  /** Tout est remplacé par ce que dit le serveur : réglages et brouillon. */
  const appliquer = useCallback((charge) => {
    if (!charge?.vitrine) return;
    const n = normaliser(charge.vitrine);
    setDonnees(charge);
    setServeur(n);
    setValeurs(n);
    setErreur(null);
    // Les données de l'aperçu (catalogue, catégories) sont relues après
    // chaque enregistrement.
    setVersion((x) => x + 1);
  }, []);

  /**
   * Le serveur a changé un seul réglage (mise en ligne) : le brouillon garde
   * le reste de ce que le vendeur était en train de modifier.
   */
  const appliquerEnLigne = useCallback((charge) => {
    if (!charge?.vitrine) return;
    const n = normaliser(charge.vitrine);
    setDonnees(charge);
    setServeur(n);
    setValeurs((v) => ({ ...v, active: n.active }));
  }, []);

  useEffect(() => {
    if (!version) return undefined;
    let annule = false;
    getApercuVitrine()
      .then((r) => { if (!annule) setApercu(extraire(r)); })
      .catch(() => { if (!annule) setApercu(null); });
    return () => { annule = true; };
  }, [version]);

  // Un 404 veut dire « pas encore de boutique » : la page le sait déjà par
  // useBoutique et propose de la créer. Le message ne sert qu'aux pannes.
  const echecChargement = useCallback((e) => {
    setErreur(e?.response?.data?.message || 'Votre site n’a pas pu être chargé.');
  }, []);

  useEffect(() => {
    let annule = false;
    getMaVitrine()
      .then((r) => { if (!annule) appliquer(extraire(r)); })
      .catch((e) => { if (!annule) echecChargement(e); })
      .finally(() => { if (!annule) setLoading(false); });
    return () => { annule = true; };
  }, [appliquer, echecChargement]);

  /**
   * Relit le site après un changement fait ailleurs sur la page — les infos
   * de la boutique (nom, logo, téléphone) que l'aperçu et le partage
   * reprennent. Le brouillon en cours n'est pas touché ; s'il n'y en a pas
   * encore (boutique tout juste créée), tout est chargé.
   */
  const rafraichir = useCallback(async () => {
    try {
      const charge = extraire(await getMaVitrine());
      if (!charge?.vitrine) return;
      if (!serveur) {
        appliquer(charge);
      } else {
        setDonnees(charge);
        setVersion((x) => x + 1);
      }
    } catch (e) {
      echecChargement(e);
    }
  }, [serveur, appliquer, echecChargement]);

  const modifie = useMemo(() => Boolean(serveur) && !egal(valeurs, serveur), [valeurs, serveur]);

  const majChamp = (champ, valeur) => setValeurs((v) => ({ ...v, [champ]: valeur }));

  const majSection = (nom, actif) =>
    setValeurs((v) => ({ ...v, sections: { ...v.sections, [nom]: actif } }));

  const majReseau = (nom, url) =>
    setValeurs((v) => ({ ...v, reseaux: { ...v.reseaux, [nom]: url } }));

  const majBloc = (nom, valeur) =>
    setValeurs((v) => ({ ...v, blocs: { ...v.blocs, [nom]: valeur } }));

  /** Revenir à ce qui est enregistré. */
  const annuler = () => { if (serveur) setValeurs(serveur); };

  const configuree = donnees?.vitrine?.configuree === true;
  const slugEnregistre = donnees?.vitrine?.slug || '';

  // Tant que le site n'a jamais été publié, « Enregistrer » garde le
  // brouillon hors ligne : seule « Publier mon site » le met en ligne.
  const enregistrer = async () => {
    setSaving(true);
    try {
      const envoi = aEnvoyer(valeurs, slugEnregistre);
      const r = await modifierVitrine(configuree ? envoi : { ...envoi, active: false });
      appliquer(extraire(r));
      toast.success(configuree ? 'Votre site est à jour.' : 'Brouillon enregistré. Publiez votre site quand il vous plaît.');
      return true;
    } catch (e) {
      // Le message du serveur est écrit pour le vendeur — « Cette adresse est
      // déjà prise par une autre boutique » — et vaut mieux qu'un texte générique.
      toast.error(messageErreur(e, 'La mise à jour a échoué.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Mise en ligne / hors ligne immédiate, sans passer par « Enregistrer ».
   * Les modifications en cours restent dans le brouillon.
   */
  const [bascule, setBascule] = useState(false);
  const basculerEnLigne = async (active) => {
    const ok = await showConfirm(active ? {
      titre: 'Remettre mon site en ligne',
      message: 'Votre site sera de nouveau visible par tous à son adresse.',
      confirmText: 'Remettre en ligne',
    } : {
      titre: 'Mettre mon site hors ligne',
      message: "Vos clients ne pourront plus l'ouvrir. Votre boutique reste visible dans l'application.",
      confirmText: 'Mettre hors ligne',
      danger: true,
    });
    if (!ok) return;
    setBascule(true);
    try {
      appliquerEnLigne(extraire(await modifierVitrine({ active })));
      toast.success(active ? 'Votre site est en ligne.' : 'Votre site est hors ligne.');
    } catch (e) {
      toast.error(messageErreur(e, 'Impossible de modifier votre site.'));
    } finally {
      setBascule(false);
    }
  };

  /**
   * Première publication : les réglages du vendeur sont enregistrés et le
   * site passe en ligne, en un geste.
   */
  const publier = async () => {
    const ok = await showConfirm({
      titre: 'Publier mon site',
      message: 'Votre site sera visible par tous à son adresse. Vous pourrez encore le modifier ou le mettre hors ligne.',
      confirmText: 'Publier',
    });
    if (!ok) return false;
    setSaving(true);
    try {
      const r = await modifierVitrine({ ...aEnvoyer(valeurs, slugEnregistre), active: true });
      appliquer(extraire(r));
      toast.success('Votre site est en ligne ! Partagez son adresse à vos clients.');
      return true;
    } catch (e) {
      toast.error(messageErreur(e, 'La publication a échoué.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Photos du haut du site ────────────────────────────────────────
  // Enregistrées à chaque geste, sans passer par « Enregistrer » : seule la
  // liste des photos est remplacée, le brouillon des autres réglages reste
  // tel que le vendeur l'a laissé. L'aperçu est relu pour les montrer.
  const [photosOccupe, setPhotosOccupe] = useState(false);
  const appliquerPhotos = useCallback((charge) => {
    if (!charge?.vitrine) return;
    setDonnees((d) => (d ? {
      ...d,
      vitrine: { ...d.vitrine, photos: charge.vitrine.photos || [], photosMax: charge.vitrine.photosMax },
    } : d));
    setVersion((n) => n + 1);
  }, []);

  const ajouterPhotos = async (fichiers) => {
    const choisies = [...(fichiers || [])];
    const images = choisies.filter((f) => /^image\/(jpeg|png)$/.test(f.type));
    const legeres = images.filter((f) => f.size <= TAILLE_MAX_PHOTO);
    const place = Math.max(0, (donnees?.vitrine?.photosMax || 10) - (donnees?.vitrine?.photos?.length || 0));
    const liste = legeres.slice(0, place);

    // Ce qui n'est pas parti est dit tout de suite, avec la raison.
    const ecarts = [];
    if (images.length < choisies.length) ecarts.push('seules les photos JPEG ou PNG sont acceptées');
    if (legeres.length < images.length) ecarts.push('une photo ne doit pas dépasser 5 Mo');
    if (liste.length < legeres.length) ecarts.push(`votre site accepte ${donnees?.vitrine?.photosMax || 10} photos au plus`);
    if (ecarts.length) toast.warning(`Certaines photos n'ont pas été ajoutées : ${ecarts.join(' ; ')}.`);
    if (!liste.length) return;

    setPhotosOccupe(true);
    try {
      const r = await ajouterPhotosVitrine(liste);
      appliquerPhotos(extraire(r));
      toast.success(r?.data?.message || 'Photos ajoutées à votre site.');
    } catch (e) {
      toast.error(messageErreur(e, "Les photos n'ont pas pu être ajoutées."));
    } finally {
      setPhotosOccupe(false);
    }
  };

  const retirerPhoto = async (photo) => {
    const ok = await showConfirm({
      titre: 'Retirer cette photo ?',
      message: 'Elle ne défilera plus en haut de votre site.',
      confirmText: 'Retirer',
      danger: true,
    });
    if (!ok) return;
    setPhotosOccupe(true);
    try {
      appliquerPhotos(extraire(await supprimerPhotoVitrine(photo.id)));
      toast.success('Photo retirée de votre site.');
    } catch (e) {
      toast.error(messageErreur(e, "La photo n'a pas pu être retirée."));
    } finally {
      setPhotosOccupe(false);
    }
  };

  /** Avance (-1) ou recule (+1) une photo dans l'ordre du défilé. */
  const deplacerPhoto = async (index, sens) => {
    const photos = donnees?.vitrine?.photos || [];
    const cible = index + sens;
    if (cible < 0 || cible >= photos.length) return;
    const ordre = photos.map((p) => p.id);
    [ordre[index], ordre[cible]] = [ordre[cible], ordre[index]];
    setPhotosOccupe(true);
    try {
      appliquerPhotos(extraire(await ordonnerPhotosVitrine(ordre)));
    } catch (e) {
      toast.error(messageErreur(e, "L'ordre des photos n'a pas pu être enregistré."));
    } finally {
      setPhotosOccupe(false);
    }
  };

  /**
   * Supprimer le site : il disparaît d'Internet et ses réglages sont effacés.
   * Les produits, les commandes et la boutique dans l'application restent.
   */
  const supprimerSite = async () => {
    const ok = await showConfirm({
      titre: 'Supprimer mon site',
      message: "Votre site ne sera plus accessible et ses réglages (mise en page, couleur, textes) seront effacés. Vos produits restent dans l'application et dans votre tableau de bord.",
      confirmText: 'Supprimer le site',
      danger: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      const r = await supprimerVitrine();
      appliquer(extraire(r));
      toast.success('Votre site a été supprimé. Vos produits sont toujours là.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(messageErreur(e, 'La suppression a échoué.'));
    } finally {
      setSaving(false);
    }
  };

  return {
    donnees,
    valeurs,
    loading,
    saving,
    erreur,
    modifie,
    majChamp,
    majSection,
    majReseau,
    majBloc,
    annuler,
    rafraichir,
    enregistrer,
    publier,
    supprimerSite,
    basculerEnLigne,
    bascule,
    apercu,
    url: donnees?.vitrine?.url || '',
    // Le site a-t-il déjà été publié une fois (assistant de l'application,
    // ou bouton « Publier mon site » de cette page) ?
    configuree,
    // Ce qui est en ligne pour de vrai — pas le brouillon.
    enLigne: configuree && donnees?.vitrine?.active !== false,
    slugEnregistre,
    nombreProduits: donnees?.nombreProduits ?? 0,
    vues: donnees?.vitrine?.vues ?? 0,
    boutique: donnees?.boutique || null,
    photos: donnees?.vitrine?.photos || [],
    photosMax: donnees?.vitrine?.photosMax || 10,
    photosOccupe,
    ajouterPhotos,
    retirerPhoto,
    deplacerPhoto,
  };
}
