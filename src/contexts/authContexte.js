import { createContext } from 'react';

/**
 * Contexte d'authentification, isolé du composant qui le fournit.
 *
 * Un fichier qui exporte autre chose qu'un composant casse le rafraîchissement
 * à chaud de Vite : le contexte vit donc ici, le fournisseur dans
 * AuthContext.jsx.
 */
export const AuthContext = createContext(null);
