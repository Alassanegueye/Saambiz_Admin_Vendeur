import { lazy } from 'react';

/**
 * Après un déploiement, les fichiers JavaScript changent de nom (leur nom
 * porte une empreinte du contenu) et les anciens disparaissent. Un onglet
 * ouvert avant le déploiement réclame encore les anciens noms : le navigateur
 * répond « Failed to fetch dynamically imported module » et la page reste
 * vide. Recharger la page récupère la nouvelle version.
 *
 * Une seule tentative par minute : si le fichier manque vraiment (déploiement
 * cassé), on n'entre pas dans une boucle de rechargements.
 */
const CLE = 'saambiz.rechargement-version';

export function rechargerPourNouvelleVersion() {
  let dernier = 0;
  try { dernier = Number(sessionStorage.getItem(CLE)) || 0; } catch { /* stockage indisponible */ }
  if (Date.now() - dernier < 60_000) return false;
  try { sessionStorage.setItem(CLE, String(Date.now())); } catch { /* stockage indisponible */ }
  window.location.reload();
  return true;
}

/** `React.lazy` qui recharge la page si le fichier de la page a disparu. */
export function lazyFiable(importer) {
  return lazy(() => importer().catch((erreur) => {
    if (rechargerPourNouvelleVersion()) return new Promise(() => {}); // la page se recharge
    throw erreur;
  }));
}

/** Les fichiers préchargés par Vite échouent aussi : même remède. */
export function surveillerNouvelleVersion() {
  window.addEventListener('vite:preloadError', (evenement) => {
    if (rechargerPourNouvelleVersion()) evenement.preventDefault();
  });
}
