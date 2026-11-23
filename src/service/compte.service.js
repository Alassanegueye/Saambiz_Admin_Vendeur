import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

// Le compte de l'utilisateur connecté — utilisé par la page « Mon profil ».
export const modifierProfil = (data) => api.put(ENDPOINTS.COMPTE.MODIFIER_PROFIL, data);

/**
 * Suppression du compte par son propriétaire. Le serveur refuse en 409 tant
 * qu'une commande est en cours : c'est son message qu'il faut relayer.
 */
export const supprimerMonCompte = (motif) =>
  api.delete(ENDPOINTS.COMPTE.SUPPRIMER, { data: motif ? { motif } : undefined });
