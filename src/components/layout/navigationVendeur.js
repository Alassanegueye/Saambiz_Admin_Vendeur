/**
 * Rubriques de l'espace vendeur, dans l'ordre de la barre.
 *
 * Chaque page a désormais son propre onglet : Commandes et Promotions ne
 * sont plus rangées derrière un menu « Ventes », et « Ma boutique » est une
 * seule page (le site, ses produits et les infos de la boutique). Un vendeur
 * voit tout d'un coup d'œil, sans menu à ouvrir pour trouver où cliquer.
 *
 * Le regroupement reste possible : une entrée avec `label` et plusieurs
 * `codes` redevient un menu dépliant (voir construireNavigation).
 *
 * Module séparé du composant : un fichier qui exporte à la fois un
 * composant et des constantes désactive le Fast Refresh de Vite.
 */
export const GROUPES = [
  { codes: ['ACCUEIL'] },
  { codes: ['PRODUITS'] },
  { codes: ['COMMANDES'] },
  { codes: ['PROMOTIONS'] },
  { codes: ['BOUTIQUE'] },
  { codes: ['MESSAGES'] },
  { codes: ['ABONNEMENT'] },
];

/**
 * Phrase d'aide de chaque rubrique : sous la page dans un menu dépliant, en
 * info-bulle sur un onglet de la barre.
 */
export const AIDES = {
  PRODUITS: 'Ajouter, modifier et retirer vos produits',
  COMMANDES: 'Les commandes de vos clients, à préparer et livrer',
  PROMOTIONS: 'Réductions sur vos produits',
  BOUTIQUE: 'Votre site web, ses produits et les infos de votre boutique',
};

/**
 * Construit la navigation à partir des rubriques.
 * @param items [{ code, to, label, icon, end }]
 * @returns [{ type: 'lien', item } | { type: 'groupe', label, icone, enfants }]
 */
export function construireNavigation(items) {
  const parCode = new Map(items.map((i) => [i.code, i]));
  const ranges = new Set();
  const nav = [];

  for (const g of GROUPES) {
    const enfants = g.codes.map((c) => parCode.get(c)).filter(Boolean);
    enfants.forEach((e) => ranges.add(e.code));
    if (enfants.length === 0) continue;
    if (!g.label || enfants.length === 1) {
      enfants.forEach((item) => nav.push({ type: 'lien', item, groupe: g.label }));
    } else {
      nav.push({ type: 'groupe', label: g.label, icone: parCode.get(g.icone)?.icon || enfants[0].icon, enfants });
    }
  }

  for (const item of items) {
    if (!ranges.has(item.code)) nav.push({ type: 'lien', item });
  }
  return nav;
}

/** La rubrique `item` correspond-elle à l'adresse courante ? */
export function estActif(item, pathname) {
  if (item.end || item.to === '/') return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
