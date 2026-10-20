/**
 * Rubriques de l'espace vendeur, rangées comme celles de l'administration :
 * les pages d'un même sujet vivent derrière un menu dépliant, avec une
 * phrase d'aide sous chaque page pour qu'un vendeur sache où cliquer sans
 * avoir à deviner.
 *
 * Module séparé du composant : un fichier qui exporte à la fois un
 * composant et des constantes désactive le Fast Refresh de Vite.
 */
export const GROUPES = [
  { codes: ['ACCUEIL'] },
  { codes: ['PRODUITS'] },
  { label: 'Ventes', icone: 'COMMANDES', codes: ['COMMANDES', 'PROMOTIONS'] },
  { label: 'Ma boutique', icone: 'BOUTIQUE', codes: ['BOUTIQUE', 'VITRINE'] },
  { codes: ['MESSAGES'] },
  { codes: ['ABONNEMENT'] },
];

/** Phrase d'aide sous chaque page dans les menus dépliants. */
export const AIDES = {
  COMMANDES: 'Les commandes de vos clients, à préparer et livrer',
  PROMOTIONS: 'Réductions sur vos produits',
  BOUTIQUE: 'Nom, logo, catégories et coordonnées',
  VITRINE: 'Votre site web, à partager à vos clients',
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
