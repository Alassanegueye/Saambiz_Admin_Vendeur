import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * Réglages publics du backend. Le serveur répond toujours 200, avec des
 * valeurs par défaut en cas de panne : ces deux appels ne font donc jamais
 * échouer l'écran qui les utilise.
 */

/** `{ contacts: { whatsapp, email, telephone }, questions: [...] }` */
export const getCentreAide = () => api.get(ENDPOINTS.CONFIG.CENTRE_AIDE);

/** `{ prix, devise }` — le tarif en vigueur, pour l'afficher avant de payer. */
export const getPrixAbonnement = () => api.get(ENDPOINTS.CONFIG.PRIX_ABONNEMENT);
