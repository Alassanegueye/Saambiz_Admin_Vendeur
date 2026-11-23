import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMessagesSite } from '../service/vendeur.service';

/**
 * Combien de messages le vendeur n'a pas encore lus.
 *
 * Messages et Abonnement ont quitté la barre de navigation pour le menu du
 * compte : sans ce compteur, un message arrivé pendant que le vendeur
 * travaille serait invisible — il faudrait ouvrir le menu pour le découvrir.
 * La pastille le dit depuis la barre.
 *
 * Recompté à chaque changement de page : c'est le moment où le vendeur vient
 * peut-être de lire ses messages, et c'est gratuit à l'échelle d'un
 * back-office. Un échec ne remonte aucune erreur — une pastille absente vaut
 * mieux qu'un message d'erreur pour un compteur décoratif.
 */
export default function useMessagesNonLus() {
  const [nonLus, setNonLus] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let vivant = true;
    getMessagesSite()
      .then((res) => {
        if (!vivant) return;
        const messages = res.data?.messages || [];
        setNonLus(Array.isArray(messages) ? messages.filter((m) => !m.lu).length : 0);
      })
      .catch(() => { if (vivant) setNonLus(0); });
    // La page a pu être quittée avant la réponse.
    return () => { vivant = false; };
  }, [pathname]);

  return nonLus;
}
