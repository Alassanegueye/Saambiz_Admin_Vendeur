/**
 * Le numéro tel que l'opérateur l'attend : neuf chiffres, sans indicatif ni
 * séparateurs. Le vendeur l'écrit comme il veut — « 77 123 45 67 »,
 * « +221771234567 » — et c'est la même demande de paiement qui part.
 * Rend `null` si ce n'est pas un numéro sénégalais à neuf chiffres.
 */
export function normaliserTelephone(saisie) {
  const chiffres = String(saisie || '')
    .replace(/\D/g, '')
    .replace(/^00221/, '')
    .replace(/^221/, '');
  return /^\d{9}$/.test(chiffres) ? chiffres : null;
}
