import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNombreMessagesNonLus } from '../service/vendeur.service';

/**
 * Combien de messages le vendeur n'a pas encore lus.
 *
 * Messages et Abonnement ont quitté la barre de navigation pour le menu du
 * compte : sans ce compteur, un message arrivé pendant que le vendeur
 * travaille serait invisible — il faudrait ouvrir le menu pour le découvrir.
 * La pastille le dit depuis la barre.
 *
 * Le total vient de l'API (`GET /messages/non-lus`), qui additionne les deux
 * sources : les messages reçus dans l'application et ceux laissés sur la page
 * Contact du site de la boutique. Ce compteur ne lisait d'abord que la liste
 * des messages du site — un acheteur qui écrivait depuis l'application
 * n'allumait donc aucune pastille, alors que c'est exactement le cas qu'elle
 * doit signaler.
 *
 * Recompté à chaque changement de page : c'est le moment où le vendeur vient
 * peut-être de lire ses messages, et une requête de plus ne coûte rien à
 * l'échelle d'un back-office. Un échec ne remonte aucune erreur — une
 * pastille absente vaut mieux qu'un message d'erreur pour un compteur
 * décoratif.
 */
export default function useMessagesNonLus() {
  const [nonLus, setNonLus] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let vivant = true;
    getNombreMessagesNonLus()
      .then((res) => {
        if (!vivant) return;
        const total = Number(res.data?.nonLus);
        setNonLus(Number.isFinite(total) && total > 0 ? total : 0);
      })
      .catch(() => { if (vivant) setNonLus(0); });
    // La page a pu être quittée avant la réponse.
    return () => { vivant = false; };
  }, [pathname]);

  return nonLus;
}
