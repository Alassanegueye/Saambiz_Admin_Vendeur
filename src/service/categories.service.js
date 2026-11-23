import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

// Lecture seule : un vendeur choisit une catégorie, il n'en crée pas. Les
// trois mutations déclarées ici visaient des routes `/admin/*`, interdites à
// un jeton de vendeur ; elles n'étaient appelées nulle part.
export const getCategories = () => api.get(ENDPOINTS.CATEGORIES.LIST);
