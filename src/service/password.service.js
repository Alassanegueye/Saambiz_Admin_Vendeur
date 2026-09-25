import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const changerMotDePasse = (data) => api.post(ENDPOINTS.AUTH.CHANGER_MOT_DE_PASSE, data);
