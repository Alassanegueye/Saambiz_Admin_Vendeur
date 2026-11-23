import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const { NOTIFICATIONS } = ENDPOINTS;

/**
 * Les alertes du compte : commande reçue, abonnement qui expire, produit
 * modéré. Mêmes routes que l'application mobile — le serveur écrit la même
 * notification pour les deux, le vendeur doit donc la lire des deux côtés.
 */

export const getNotifications = (params) => api.get(NOTIFICATIONS.LIST, { params });

export const getNombreNonLues = () => api.get(NOTIFICATIONS.NON_LUES);

export const marquerNotificationLue = (id) => api.put(NOTIFICATIONS.LUE(id));

export const marquerToutesLues = () => api.put(NOTIFICATIONS.TOUTES_LUES);
