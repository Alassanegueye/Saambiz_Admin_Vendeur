/**
 * Outils purs de la page « Ma boutique » : rien ici ne parle au serveur ni à
 * React, tout se teste seul (voir outilsSite.test.js).
 */

/** Même règle que le serveur : 3 à 60 caractères, a-z, 0-9 et tirets intérieurs. */
export const ADRESSE_VALIDE = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

/** Plafonds du serveur pour les sections du site. */
export const MAX_SECTIONS = 12;
export const MAX_PRODUITS_PAR_SECTION = 60;

/** « 1 produit », « 3 produits ». */
export const pluriel = (n, mot, motPluriel = `${mot}s`) => `${n} ${n > 1 ? motPluriel : mot}`;

/**
 * Ce que le vendeur tape dans l'adresse de son site, rendu utilisable au fil
 * de la frappe : minuscules, accents retirés, espaces et apostrophes changés
 * en tirets. « Chez Fatou » devient « chez-fatou ».
 *
 * Un tiret en bout de chaîne reste le temps de la saisie — on tape
 * « chez- » avant « chez-fatou » ; `erreurAdresse` le refuse ensuite.
 */
export function nettoyerAdresse(texte) {
  return String(texte || '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s'’_.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, 60);
}

/** Le message à montrer sous l'adresse, ou `null` si elle convient. */
export function erreurAdresse(adresse) {
  const a = String(adresse || '');
  if (a.length < 3) return 'L’adresse doit faire au moins 3 caractères.';
  if (!ADRESSE_VALIDE.test(a)) {
    return 'Lettres sans accent, chiffres et tirets seulement — sans tiret au début ni à la fin.';
  }
  return null;
}

/** Le début de l'adresse du site, sans « https:// » : « saambiz.com/b/ ». */
export function prefixeAdresse(url) {
  const sansProtocole = String(url || '').replace(/^https?:\/\//i, '');
  const i = sansProtocole.lastIndexOf('/');
  return i >= 0 ? sansProtocole.slice(0, i + 1) : 'saambiz.com/b/';
}

/** Adresse d'un profil à partir d'un nom de compte (« @ma.boutique »). */
const PROFILS = {
  facebook: (c) => `https://facebook.com/${c}`,
  instagram: (c) => `https://instagram.com/${c}`,
  tiktok: (c) => `https://tiktok.com/@${c}`,
  snapchat: (c) => `https://snapchat.com/add/${c}`,
};

/**
 * Le lien d'un réseau social tel que le serveur l'accepte (https://…).
 *
 * Le vendeur connaît son nom de compte bien mieux que l'adresse de sa page :
 * « @sanse.couture » devient « https://instagram.com/sanse.couture ». Une
 * adresse tapée sans « https:// » le reçoit. Le reste est laissé tel quel.
 */
export function completerLien(reseau, texte) {
  const t = String(texte || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  const compte = t.match(/^@([\w.-]+)$/);
  if (compte && PROFILS[reseau]) return PROFILS[reseau](compte[1]);
  return `https://${t.replace(/^\/+/, '')}`;
}

/** Égalité de valeurs (objets, tableaux, textes) : sert à savoir s'il reste quelque chose à enregistrer. */
export function egal(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => egal(x, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && egal(a[k], b[k]));
}

/**
 * Identifiant d'une nouvelle section, au format accepté par le serveur
 * (4 à 40 caractères, lettres et chiffres). À appeler dans un gestionnaire
 * d'événement, jamais pendant le rendu.
 */
export const nouvelIdSection = () =>
  `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Les sections qui montrent au moins un produit : les seules visibles des clients. */
export const sectionsRemplies = (sections = []) =>
  sections.filter((s) => (s.produitIds || []).length > 0);

/**
 * Où en est chaque étape du site : un résumé d'une ligne, lisible fermé, et
 * `fait` quand le vendeur y a mis quelque chose. Les étapes qui ont toujours
 * une valeur (apparence, commandes) ne sont jamais « faites » : une coche
 * qui s'affiche sans rien faire ne dirait rien.
 */
export function etatDesEtapes({ valeurs, photos = [], modeles = [], couleurs = [] }) {
  const modele = modeles.find((m) => m.cle === valeurs.modele)?.nom || 'Classique';
  const accent = String(valeurs.accent || '').toLowerCase();
  const couleur = couleurs.find((c) => c.valeur.toLowerCase() === accent)?.nom || 'Couleur personnalisée';

  const sections = valeurs.sectionsPerso || [];
  const remplies = sectionsRemplies(sections);
  const vides = sections.length - remplies.length;
  const produits = new Set(sections.flatMap((s) => s.produitIds || [])).size;

  const avantages = (valeurs.blocs?.avantages || []).filter((a) => a.titre?.trim());
  const reseaux = Object.values(valeurs.reseaux || {}).filter((l) => String(l || '').trim()).length;
  const infos = [
    valeurs.horaires?.trim() && 'horaires',
    valeurs.apropos?.trim() && 'présentation',
    reseaux && pluriel(reseaux, 'réseau social', 'réseaux sociaux'),
  ].filter(Boolean);
  const premiereMajuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  return {
    style: { fait: false, resume: `${modele} · ${couleur}` },
    photos: {
      fait: photos.length > 0,
      resume: photos.length
        ? `${pluriel(photos.length, 'photo')} en haut du site`
        : 'Aucune photo — le haut du site prend votre couleur',
    },
    sections: {
      fait: remplies.length > 0,
      aFaire: remplies.length === 0,
      resume: sections.length === 0
        ? 'Aucune section — votre site ne montre encore aucun produit'
        : [
          pluriel(sections.length, 'section'),
          pluriel(produits, 'produit'),
          vides > 0 && `${pluriel(vides, 'vide')}`,
        ].filter(Boolean).join(' · '),
    },
    avantages: {
      fait: avantages.length > 0,
      resume: avantages.length ? avantages.map((a) => a.titre.trim()).join(' · ') : 'Aucun avantage affiché',
    },
    infos: {
      fait: infos.length > 0,
      resume: infos.length ? premiereMajuscule(infos.join(', ')) : 'Ni horaires, ni présentation, ni réseaux',
    },
    commandes: {
      fait: false,
      resume: valeurs.commande
        ? `Commandes sur le site${valeurs.paiementLivraison ? ' · paiement à la livraison' : ''}`
        : 'Catalogue seulement — vos clients vous écrivent sur WhatsApp',
    },
  };
}

/**
 * Ce qui empêcherait le serveur d'enregistrer le brouillon, dit avant
 * l'envoi et rattaché à l'étape où le corriger. `null` si tout va bien.
 *
 * L'adresse n'est vérifiée que si le vendeur l'a changée : inchangée, elle
 * ne part pas (voir useVitrine).
 */
export function verifierBrouillon(valeurs, { slugEnregistre } = {}) {
  const adresse = valeurs.slug === slugEnregistre ? null : erreurAdresse(valeurs.slug);
  if (adresse) return { etape: 'commandes', message: `Adresse du site : ${adresse}` };
  const sansNom = (valeurs.sectionsPerso || []).findIndex((s) => !String(s.titre || '').trim());
  if (sansNom >= 0) return { etape: 'sections', message: `Donnez un nom à la section n° ${sansNom + 1}.` };
  return null;
}
