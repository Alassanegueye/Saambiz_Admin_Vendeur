import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const login = (email, password) =>
  api.post(ENDPOINTS.AUTH.LOGIN, { email, mot_de_passe: password });

/**
 * Déconnexion. Le refresh est transmis pour être révoqué côté serveur :
 * sans lui, la session resterait reconstituable jusqu'à son expiration.
 */
export const logout = (refreshToken) =>
  api.post(ENDPOINTS.AUTH.LOGOUT, refreshToken ? { refreshToken } : {});

export const getMe = () => api.get(ENDPOINTS.AUTH.ME);
