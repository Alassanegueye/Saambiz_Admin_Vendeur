import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

// Le compte de l'utilisateur connecté — utilisé par la page « Mon profil ».
export const modifierProfil = (data) => api.put(ENDPOINTS.COMPTE.MODIFIER_PROFIL, data);
