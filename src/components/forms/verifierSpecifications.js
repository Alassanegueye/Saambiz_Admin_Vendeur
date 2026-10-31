/**
 * Erreurs des champs obligatoires (définis par l'admin), avant l'envoi.
 *
 * Cette fonction vivait dans ChampsSpecifications.jsx, à côté du composant qui
 * affiche ces champs. Un fichier qui exporte un composant ET autre chose casse
 * le rafraîchissement à chaud de Vite — modifier le composant recharge la page
 * entière au lieu de remplacer le module, et l'état du formulaire en cours de
 * saisie est perdu. La règle `react-refresh/only-export-components` le refuse,
 * et le lint échouait donc avant tout déploiement.
 *
 * @param {Array}  specifications  suggestions de la catégorie
 * @param {object} valeurs         { cle: valeur }
 * @returns {object} { cle: message } — vide si tout est renseigné
 */
export function verifierSpecifications(specifications = [], valeurs = {}) {
  const erreurs = {};
  for (const s of specifications) {
    if (!s.obligatoire || s.type === 'oui_non') continue;
    const v = valeurs[s.cle];
    const vide = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
    if (vide) erreurs[s.cle] = 'À renseigner';
  }
  return erreurs;
}
