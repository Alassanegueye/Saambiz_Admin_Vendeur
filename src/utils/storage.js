/**
 * Stockage de la session.
 *
 * `sessionStorage` et non `localStorage` : la session ne survit pas à la
 * fermeture de l'onglet. C'est le comportement attendu sur les postes
 * partagés — un ordinateur de boutique, un cybercafé — où la session d'un
 * vendeur restait ouverte pour le suivant.
 *
 * Le jeton, son expiration et l'utilisateur vivent dans le MÊME stockage.
 * Séparés, ils divergent : on se retrouve avec un utilisateur sans jeton, ou
 * l'inverse, et l'application affiche une interface connectée qui échoue à
 * chaque requête.
 */

const STOCKAGE = window.sessionStorage;

const CLES = {
  token: 'saambiz.token',
  refresh: 'saambiz.refresh',
  expiration: 'saambiz.expiration',
  utilisateur: 'saambiz.utilisateur',
  menus: 'saambiz.menus',
};

// ── Jeton d'accès ──────────────────────────────────────────────────────────
export const getToken = () => STOCKAGE.getItem(CLES.token);
export const removeToken = () => {
  STOCKAGE.removeItem(CLES.token);
  STOCKAGE.removeItem(CLES.expiration);
};

/**
 * Enregistre le jeton et lit son expiration depuis la charge utile.
 *
 * On décode sans vérifier la signature — impossible côté navigateur, et sans
 * objet : l'autorité reste le backend. Cette date sert uniquement à éviter
 * d'envoyer une requête qu'on sait condamnée.
 */
export const setToken = (token) => {
  STOCKAGE.setItem(CLES.token, token);
  try {
    const charge = JSON.parse(atob(token.split('.')[1]));
    if (charge.exp) STOCKAGE.setItem(CLES.expiration, String(charge.exp * 1000));
  } catch {
    // Jeton non décodable : on ne stocke pas d'expiration, le backend
    // tranchera au premier appel.
  }
};

/** Vrai si le jeton est absent ou dépassé (marge de 10 s pour l'horloge). */
export const tokenExpire = () => {
  const expiration = STOCKAGE.getItem(CLES.expiration);
  if (!expiration) return false;
  return Date.now() >= Number(expiration) - 10_000;
};

// ── Jeton de rafraîchissement ──────────────────────────────────────────────
export const getRefreshToken = () => STOCKAGE.getItem(CLES.refresh);
export const setRefreshToken = (t) => STOCKAGE.setItem(CLES.refresh, t);
export const removeRefreshToken = () => STOCKAGE.removeItem(CLES.refresh);

// ── Utilisateur ────────────────────────────────────────────────────────────
export const getUser = () => {
  try {
    const brut = STOCKAGE.getItem(CLES.utilisateur);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
};
export const setUser = (u) => STOCKAGE.setItem(CLES.utilisateur, JSON.stringify(u));
export const removeUser = () => STOCKAGE.removeItem(CLES.utilisateur);

// ── Menus RBAC ─────────────────────────────────────────────────────────────
export const getMenus = () => {
  try {
    return JSON.parse(STOCKAGE.getItem(CLES.menus) || '[]');
  } catch {
    return [];
  }
};
export const setMenus = (m) => STOCKAGE.setItem(CLES.menus, JSON.stringify(m || []));

// ── Purge complète ─────────────────────────────────────────────────────────
export const clearAuth = () => {
  Object.values(CLES).forEach((c) => STOCKAGE.removeItem(c));
};
