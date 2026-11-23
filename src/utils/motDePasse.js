/**
 * La politique de mot de passe, celle du serveur et pas une autre.
 *
 * `passwordSchema` (backend, `validators/auth.validator.js`) exige huit
 * caractères, une majuscule, un chiffre et un caractère spécial. L'espace
 * vendeur en demandait douze et annonçait en plus une minuscule obligatoire :
 * un mot de passe accepté par l'application mobile était refusé ici, sur le
 * même compte, et le vendeur n'avait aucun moyen de comprendre pourquoi.
 */

export const LONGUEUR_MIN = 8;

export const REGLES = [
  { libelle: `${LONGUEUR_MIN} caractères`, test: (v) => v.length >= LONGUEUR_MIN },
  { libelle: 'une majuscule', test: (v) => /[A-Z]/.test(v) },
  { libelle: 'un chiffre', test: (v) => /[0-9]/.test(v) },
  { libelle: 'un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const AIDE_MOT_DE_PASSE =
  `${LONGUEUR_MIN} caractères minimum, avec au moins une majuscule, un chiffre et un caractère spécial.`;

/**
 * Rend `null` si le mot de passe convient, sinon la phrase à afficher — qui
 * nomme ce qui manque, plutôt que de répéter la règle entière.
 */
export function erreurMotDePasse(valeur) {
  const v = String(valeur || '');
  const manquants = REGLES.filter((r) => !r.test(v)).map((r) => r.libelle);
  if (manquants.length === 0) return null;
  if (manquants.length === 1) return `Il manque ${manquants[0]}.`;
  const dernier = manquants.pop();
  return `Il manque ${manquants.join(', ')} et ${dernier}.`;
}
