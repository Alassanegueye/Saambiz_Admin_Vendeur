import { useCallback, useEffect, useState } from 'react';
import { getTousMesProduits } from '../../service/vendeur.service';

/**
 * Les produits du vendeur, pour remplir les sections de son site.
 *
 * Chargés une seule fois, au premier besoin (étape « Produits affichés »
 * ouverte, ou choix des produits d'une section) : un vendeur qui ne vient
 * que changer sa couleur n'attend pas son catalogue.
 */
export default function useProduitsSite(besoin) {
  const [demande, setDemande] = useState(false);
  const [produits, setProduits] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [essai, setEssai] = useState(0);

  // Le premier besoin déclenche le chargement ; il ne se rejoue pas à
  // chaque ouverture de l'étape.
  if (besoin && !demande) setDemande(true);

  useEffect(() => {
    if (!demande) return undefined;
    let annule = false;
    setChargement(true);
    setErreur(null);
    getTousMesProduits()
      .then((liste) => { if (!annule) setProduits(liste); })
      .catch(() => { if (!annule) setErreur('Vos produits n’ont pas pu être chargés.'); })
      .finally(() => { if (!annule) setChargement(false); });
    return () => { annule = true; };
  }, [demande, essai]);

  const recharger = useCallback(() => setEssai((n) => n + 1), []);

  return { produits, chargement, erreur, recharger };
}
