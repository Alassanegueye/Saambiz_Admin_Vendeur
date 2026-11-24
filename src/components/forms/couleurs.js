/**
 * Les couleurs d'un produit : un code venu du nuancier, un nom écrit par le
 * vendeur.
 *
 * Sans React, pour être vérifiable. Le format est celui que l'API attend et
 * renvoie (`Saambiz_Back/src/services/categories/specifications.js`) :
 * `[{ code: '#f2b705', nom: 'Ocre' }]`, le code pouvant manquer sur une
 * valeur héritée d'un champ texte.
 */

const HEXA = /^#[0-9a-f]{6}$/i;

/**
 * Quelques teintes de référence, pour proposer un nom à la couleur choisie.
 *
 * Proposer, pas imposer : le vendeur réécrit ce qu'il veut. Sans cela il
 * aurait à nommer lui-même chaque couleur, et on retrouverait les « rouge »,
 * « Rouge vif » et « bordeaux » que ce type de champ vient corriger.
 */
const REFERENCES = [
  ['#000000', 'Noir'], ['#ffffff', 'Blanc'], ['#808080', 'Gris'],
  ['#c0392b', 'Rouge'], ['#e67e22', 'Orange'], ['#f1c40f', 'Jaune'],
  ['#f2b705', 'Ocre'], ['#27ae60', 'Vert'], ['#145a32', 'Vert foncé'],
  ['#2980b9', 'Bleu'], ['#0d1b3d', 'Bleu nuit'], ['#8e44ad', 'Violet'],
  ['#ff9ff3', 'Rose'], ['#795548', 'Marron'], ['#d2b48c', 'Beige'],
  ['#f5f0e1', 'Écru'], ['#b8860b', 'Doré'], ['#aaa9ad', 'Argenté'],
  ['#7b1e2b', 'Bordeaux'], ['#5dade2', 'Bleu ciel'],
];

/**
 * Les pastilles proposées d'un clic dans le formulaire produit, dans l'ordre
 * où un vendeur les cherche. Une teinte qui n'y est pas se choisit dans la
 * grande palette, juste après.
 */
export const NUANCIER = [
  ['#000000', 'Noir'], ['#ffffff', 'Blanc'], ['#808080', 'Gris'], ['#aaa9ad', 'Argenté'],
  ['#c0392b', 'Rouge'], ['#7b1e2b', 'Bordeaux'], ['#ff9ff3', 'Rose'], ['#e67e22', 'Orange'],
  ['#f1c40f', 'Jaune'], ['#b8860b', 'Doré'], ['#27ae60', 'Vert'], ['#145a32', 'Vert foncé'],
  ['#5dade2', 'Bleu ciel'], ['#2980b9', 'Bleu'], ['#0d1b3d', 'Bleu nuit'], ['#8e44ad', 'Violet'],
  ['#795548', 'Marron'], ['#d2b48c', 'Beige'], ['#f5f0e1', 'Écru'],
].map(([code, nom]) => ({ code, nom }));

/**
 * La teinte d'une couleur connue seulement par son nom (« Bleu nuit ») :
 * une catégorie dont les couleurs sont encore de simples variantes garde des
 * noms, et la pastille se retrouve par le nom. `null` si le nom est inconnu.
 */
export function codeDuNom(nom) {
  const n = String(nom || '').trim().toLowerCase();
  const trouvee = REFERENCES.find(([, libelle]) => libelle.toLowerCase() === n);
  return trouvee ? trouvee[0] : null;
}

/** `#f2b705` → { r, g, b }. */
function versRvb(code) {
  const n = parseInt(code.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Le nom de la teinte de référence la plus proche.
 *
 * Distance euclidienne dans RVB : grossière pour l'œil, largement suffisante
 * pour une suggestion que le vendeur relit.
 */
export function nomSuggere(code) {
  if (!HEXA.test(code || '')) return '';
  const c = versRvb(code.toLowerCase());
  let meilleur = REFERENCES[0];
  let distance = Infinity;
  for (const reference of REFERENCES) {
    const r = versRvb(reference[0]);
    const d = (c.r - r.r) ** 2 + (c.g - r.g) ** 2 + (c.b - r.b) ** 2;
    if (d < distance) { distance = d; meilleur = reference; }
  }
  return meilleur[1];
}

/** Valeur stockée → liste de couleurs, quelle que soit sa forme d'origine. */
export function enCouleurs(valeur) {
  const liste = Array.isArray(valeur)
    ? valeur
    // Une catégorie passée de « variantes » à « couleurs » : le produit
    // porte encore « Noir, Rouge ». On garde les noms, sans teinte.
    : (typeof valeur === 'string' && valeur.trim() ? valeur.split(/,(?!\d)/) : []);

  const vues = new Set();
  const propres = [];
  for (const entree of liste) {
    const objet = typeof entree === 'string' ? { nom: entree } : (entree || {});
    const code = HEXA.test(String(objet.code || '').trim())
      ? String(objet.code).trim().toLowerCase()
      : null;
    const nom = String(objet.nom ?? '').trim().slice(0, 40) || code || '';
    if (!nom) continue;
    const empreinte = (code || nom).toLowerCase();
    if (vues.has(empreinte)) continue;
    vues.add(empreinte);
    propres.push(code ? { code, nom } : { nom });
  }
  return propres;
}

/** Cette teinte est-elle déjà dans la liste ? */
export const dejaChoisie = (couleurs, code) =>
  couleurs.some((c) => (c.code || '').toLowerCase() === String(code || '').toLowerCase());
