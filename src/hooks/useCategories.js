import { useCallback, useEffect, useState } from 'react';
import api from '../service/api';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * Catégories proposées à la création d'une boutique.
 *
 * Le serveur peut mettre près d'une minute à se réveiller (hébergement mis
 * en veille) : on lui laisse 60 s et on réessaie deux fois avant d'afficher
 * une erreur avec un bouton « Réessayer ». Avant, un échec laissait
 * « Chargement… » affiché indéfiniment et bloquait l'inscription.
 */
export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [etat, setEtat] = useState('chargement'); // 'chargement' | 'ok' | 'erreur'
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let actif = true;
    const charger = async (restant) => {
      try {
        const res = await api.get(ENDPOINTS.CATEGORIES.LIST, { timeout: 60000 });
        const liste = res.data?.categories || res.data?.data || res.data || [];
        if (!actif) return;
        setCategories(Array.isArray(liste) ? liste : []);
        setEtat('ok');
      } catch {
        if (!actif) return;
        if (restant > 0) {
          setTimeout(() => { if (actif) charger(restant - 1); }, 2000);
        } else {
          setEtat('erreur');
        }
      }
    };
    charger(2);
    return () => { actif = false; };
  }, [essai]);

  const recharger = useCallback(() => {
    setEtat('chargement');
    setEssai((n) => n + 1);
  }, []);

  return { categories, etat, recharger };
}
