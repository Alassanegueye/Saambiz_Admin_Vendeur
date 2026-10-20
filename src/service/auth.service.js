import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * Connexion par email OU téléphone, comme dans l'application mobile : un
 * même compte vendeur sert sur les deux.
 */
export const login = (identifiant, password) => {
  const valeur = String(identifiant).trim();
  const champ = valeur.includes('@')
    ? { email: valeur.toLowerCase() }
    : { telephone: valeur.replace(/[\s.-]/g, '') };
  return api.post(ENDPOINTS.AUTH.LOGIN, { ...champ, mot_de_passe: password });
};

// ─── Inscription (même parcours que l'application mobile) ───────────────────

/** 1. Un code à 6 chiffres part à l'adresse saisie. Aucun compte n'est créé. */
export const envoyerCodeInscription = (email, prenom) =>
  api.post(ENDPOINTS.AUTH.INSCRIPTION_CODE, { email, prenom });

/** 2. Le code est validé : le serveur rend un jeton (jetonEmail). */
export const verifierCodeInscription = (email, code) =>
  api.post(ENDPOINTS.AUTH.INSCRIPTION_VERIFIER, { email, code });

/** 3. Création du compte vendeur et de sa boutique, sur présentation du jeton. */
export const inscrireVendeur = (donnees) => api.post(ENDPOINTS.AUTH.REGISTER, donnees);

/**
 * Déconnexion. Le refresh est transmis pour être révoqué côté serveur :
 * sans lui, la session resterait reconstituable jusqu'à son expiration.
 */
export const logout = (refreshToken) =>
  api.post(ENDPOINTS.AUTH.LOGOUT, refreshToken ? { refreshToken } : {});

export const getMe = () => api.get(ENDPOINTS.AUTH.ME);
