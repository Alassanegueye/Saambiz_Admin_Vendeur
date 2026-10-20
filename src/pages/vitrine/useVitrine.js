import { useEffect, useState, useCallback } from 'react';
import { toast, showConfirm } from '../../utils/alert';
import { getMaVitrine, modifierVitrine } from '../../service/vendeur.service';

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
    resume: 'Bannière, rayons, puis les produits.',
    pourQui: 'Le choix sûr, quel que soit ce que vous vendez.',
  },
  {
    cle: 'galerie',
    nom: 'Galerie',
    resume: 'De grandes images en premier.',
    pourQui: 'Mode, décoration, bijoux — tout ce qui se vend par la photo.',
  },
  {
    cle: 'catalogue',
    nom: 'Catalogue',
    resume: 'Une liste dense, rapide à parcourir.',
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
  reseaux: { facebook: '', instagram: '', tiktok: '', site: '' },
  sections: { apropos: true, categories: true, avis: true, contact: true },
  commande: true,
  paiementLivraison: true,
};

/** Le corps de réponse peut arriver sous `data` ou nu selon l'ancienneté de la route. */
const extraire = (reponse) => reponse?.data?.data ?? reponse?.data ?? null;

export default function useVitrine() {
  const [donnees, setDonnees] = useState(null);
  const [valeurs, setValeurs] = useState(CHAMPS_VIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState(null);

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
        tiktok: v.reseaux?.tiktok || '',
        site: v.reseaux?.site || '',
      },
      sections: { ...CHAMPS_VIDES.sections, ...(v.sections || {}) },
      commande: v.commande !== false,
      paiementLivraison: v.paiementLivraison !== false,
    });
  }, []);

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

  const enregistrer = async () => {
    setSaving(true);
    try {
      const r = await modifierVitrine(valeurs);
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

  return {
    donnees,
    basculerEnLigne,
    bascule,
    valeurs,
    loading,
    saving,
    erreur,
    majChamp,
    majSection,
    majReseau,
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
