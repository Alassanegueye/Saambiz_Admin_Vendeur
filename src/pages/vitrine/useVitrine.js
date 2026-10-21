import { useEffect, useState, useCallback } from 'react';
import { toast, showConfirm } from '../../utils/alert';
import { getMaVitrine, modifierVitrine, supprimerVitrine, getApercuVitrine } from '../../service/vendeur.service';

/**
 * Contrôleur de la page « Mon site ».
 *
 * Le vendeur ne choisit pas un site entier parmi des maquettes : il règle un
 * moteur unique. Trois mises en page, une couleur d'accent, des sections
 * qu'on allume ou qu'on éteint. Une seule base de code à tenir pour toutes
 * les boutiques, et un commerçant qui gère la sienne depuis son téléphone n'a
 * pas à comparer des modèles pour ouvrir son site.
 *
 * Le formulaire est tenu localement et n'est envoyé qu'à l'enregistrement :
 * une sauvegarde à chaque frappe multiplierait les requêtes sur une connexion
 * mobile, et rendrait impossible d'abandonner une modification.
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

const CHAMPS_VIDES = {
  slug: '',
  active: true,
  modele: 'classique',
  accent: '#0D1B3D',
  apropos: '',
  annonce: '',
  horaires: '',
  reseaux: { facebook: '', instagram: '', snapchat: '', tiktok: '', site: '' },
  sections: { apropos: true, categories: true, avis: true, contact: true, nouveautes: true, meilleures: true },
  commande: true,
  paiementLivraison: true,
  sectionsPerso: [],
  blocs: { icones: {}, avantages: [] },
};

/** Le corps de réponse peut arriver sous `data` ou nu selon l'ancienneté de la route. */
const extraire = (reponse) => reponse?.data?.data ?? reponse?.data ?? null;

export default function useVitrine() {
  const [donnees, setDonnees] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState(null);
  // Données de la boutique pour l'aperçu en direct et la liste des catégories.
  const [version, setVersion] = useState(0);
  const [apercu, setApercu] = useState(null);

  const appliquer = useCallback((charge) => {
    if (!charge?.vitrine) return;
    const v = charge.vitrine;
    setDonnees(charge);
    setValeurs({
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
      sections: { ...CHAMPS_VIDES.sections, ...(v.sections || {}) },
      commande: v.commande !== false,
      paiementLivraison: v.paiementLivraison !== false,
      sectionsPerso: Array.isArray(v.sectionsPerso) ? v.sectionsPerso : [],
      blocs: {
        icones: v.blocs?.icones || {},
        avantages: (v.blocs?.avantages || []).map((a) => ({ icone: a.icone, titre: a.titre || '', texte: a.texte || '' })),
      },
    });
    // Les données de l'aperçu (catalogue, catégories) sont relues après
    // chaque enregistrement.
    setVersion((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!version) return undefined;
    let annule = false;
    getApercuVitrine()
      .then((r) => { if (!annule) setApercu(extraire(r)); })
      .catch(() => { if (!annule) setApercu(null); });
    return () => { annule = true; };
  }, [version]);

  useEffect(() => {
    let annule = false;

    getMaVitrine()
      .then((r) => { if (!annule) { appliquer(extraire(r)); setErreur(null); } })
      .catch((e) => {
        if (annule) return;
        // 404 : le vendeur n'a pas encore de boutique. Ce n'est pas une panne,
        // c'est une étape — la page le dit et renvoie vers « Ma boutique ».
        setErreur(e?.response?.data?.message || 'Votre site n\'a pas pu être chargé.');
      })
      .finally(() => { if (!annule) setLoading(false); });

    return () => { annule = true; };
  }, [appliquer]);

  const majChamp = (champ, valeur) => setValeurs((v) => ({ ...v, [champ]: valeur }));

  const majSection = (nom, actif) =>
    setValeurs((v) => ({ ...v, sections: { ...v.sections, [nom]: actif } }));

  const majReseau = (nom, url) =>
    setValeurs((v) => ({ ...v, reseaux: { ...v.reseaux, [nom]: url } }));

  const majBloc = (nom, valeur) =>
    setValeurs((v) => ({ ...v, blocs: { ...v.blocs, [nom]: valeur } }));

  // Tant que le site n'a jamais été publié, « Enregistrer » garde le
  // brouillon hors ligne : seule « Publier mon site » le met en ligne.
  const jamaisPublie = donnees?.vitrine?.configuree !== true;

  const enregistrer = async () => {
    setSaving(true);
    try {
      const r = await modifierVitrine(jamaisPublie ? { ...valeurs, active: false } : valeurs);
      appliquer(extraire(r));
      toast.success('Votre site a été mis à jour.');
    } catch (e) {
      // Le message du serveur est écrit pour le vendeur — « Cette adresse est
      // déjà prise par une autre boutique » — et vaut mieux qu'un texte générique.
      toast.error(e?.response?.data?.message || 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Mise en ligne / hors ligne immédiate, sans passer par « Enregistrer ».
   * Si le site n'a jamais été composé, il est créé avec la mise en page par
   * défaut et les informations de la boutique.
   */
  const [bascule, setBascule] = useState(false);
  const basculerEnLigne = async (active) => {
    const ok = await showConfirm(active ? {
      titre: 'Mettre mon site en ligne',
      message: 'Votre site sera visible par tous à son adresse. Vous pourrez le modifier ou le fermer à tout moment.',
      confirmText: 'Mettre en ligne',
    } : {
      titre: 'Mettre mon site hors ligne',
      message: "Vos clients ne pourront plus l'ouvrir. Votre boutique reste visible dans l'application.",
      confirmText: 'Mettre hors ligne',
      danger: true,
    });
    if (!ok) return;
    setBascule(true);
    try {
      const r = await modifierVitrine({ active });
      appliquer(extraire(r));
      toast.success(active ? 'Votre site est en ligne.' : 'Votre site est hors ligne.');
    } catch (e) {
      toast.error(e, 'Impossible de modifier votre site.');
    } finally {
      setBascule(false);
    }
  };

  /**
   * Première publication : le vendeur a personnalisé son site (mise en page,
   * couleur, textes) ; ses réglages sont enregistrés et le site passe en ligne.
   */
  const publier = async () => {
    const ok = await showConfirm({
      titre: 'Publier mon site',
      message: 'Votre site sera visible par tous à son adresse. Vous pourrez encore le modifier ou le mettre hors ligne.',
      confirmText: 'Publier',
    });
    if (!ok) return;
    setSaving(true);
    try {
      const r = await modifierVitrine({ ...valeurs, active: true });
      appliquer(extraire(r));
      toast.success('Votre site est en ligne !');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(e, 'La publication a échoué.');
    } finally {
      setSaving(false);
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
      toast.error(e, 'La suppression a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return {
    donnees,
    publier,
    supprimerSite,
    basculerEnLigne,
    bascule,
    valeurs,
    loading,
    saving,
    erreur,
    majChamp,
    majSection,
    majReseau,
    majBloc,
    apercu,
    enregistrer,
    url: donnees?.vitrine?.url || '',
    // Le site a-t-il déjà été créé (assistant de l'application, ou bouton
    // « Mettre mon site en ligne » de cette page) ?
    configuree: donnees?.vitrine?.configuree === true,
    nombreProduits: donnees?.nombreProduits ?? 0,
    vues: donnees?.vitrine?.vues ?? 0,
    boutique: donnees?.boutique || null,
  };
}
