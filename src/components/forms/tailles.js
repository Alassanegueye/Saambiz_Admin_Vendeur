/**
 * Tailles de vêtements proposées d'un clic dans le formulaire produit.
 *
 * La catégorie ne fait que nommer la case « Tailles » : sans liste, le
 * vendeur tapait « S », Entrée, « M », Entrée… à chaque produit. Les tailles
 * courantes sont donc affichées tout de suite, à cocher ; une taille qui n'y
 * est pas (« 46 », « Taille unique ») se tape toujours dans le champ libre.
 *
 * Seulement pour l'habillement : la « taille » d'un gâteau se compte en parts.
 */
export const TAILLES_VETEMENTS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

/** Catégories dont la case « Tailles » parle de vêtements. */
const CATEGORIES_HABILLEMENT = new Set(['mode-femme', 'mode-homme', 'sport-loisirs', 'enfants-bebes']);

/**
 * Les options à proposer pour un champ : celles de l'administrateur s'il en
 * a mis, sinon les tailles de vêtements quand le champ s'y prête.
 *
 * @param {object} spec       le champ (cle, options, aide…)
 * @param {string} categorie  slug de la catégorie du produit
 */
export function optionsProposees(spec, categorie) {
  if (spec?.options?.length) return spec.options;
  const estTaille = spec?.cle === 'tailles';
  const habillement = CATEGORIES_HABILLEMENT.has(categorie) || /\bS\b.*\bM\b/.test(spec?.aide || '');
  return estTaille && habillement ? TAILLES_VETEMENTS : [];
}

/**
 * Remet les valeurs choisies dans l'ordre des options (« S, M, L » et non
 * l'ordre des clics), les valeurs tapées à la main à la suite.
 */
export function dansLOrdre(valeurs, options) {
  const bas = (x) => String(x).toLowerCase();
  const proposees = options.filter((o) => valeurs.some((v) => bas(v) === bas(o)));
  const tapees = valeurs.filter((v) => !options.some((o) => bas(o) === bas(v)));
  return [...proposees, ...tapees];
}
