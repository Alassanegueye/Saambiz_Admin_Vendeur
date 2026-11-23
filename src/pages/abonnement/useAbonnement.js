import { useEffect, useState, useCallback } from 'react';
import { toast } from '../../utils/alert';
import {
  getMonAbonnement,
  getHistoriquePaiements,
  initierRenouvellement,
  payerAbonnement,
} from '../../service/vendeur.service';
import { getUser } from '../../utils/storage';
import { normaliserTelephone } from '../../utils/telephone';
import logoWave from '../../assets/paiement/wave.webp';
import logoOrangeMoney from '../../assets/paiement/orange-money.webp';

/**
 * Contrôleur de la page Abonnement.
 *
 * Le renouvellement se fait en deux temps, comme dans l'application mobile :
 * `/vendeur/initier-renouvellement` annonce le montant dû, puis
 * `/paiement/payer` déclenche la demande chez l'opérateur.
 *
 * Le second temps manquait. La page appelait l'initiation, cherchait dans sa
 * réponse une adresse de redirection qui n'y est pas, puis annonçait
 * « Renouvellement initié » : le vendeur croyait avoir payé, et rien n'était
 * jamais demandé ni débité.
 */

/**
 * Les opérateurs réellement branchés.
 *
 * Free Money figurait dans cette liste, mais le backend ne l'accepte pas :
 * `METHODES_SUPPORTEES` vaut `['orange_money', 'wave']`, et toute autre
 * valeur repart en 400 « Méthode de paiement non supportée ». Le vendeur
 * pouvait donc le choisir et voir son renouvellement échouer. À remettre
 * ici, avec son logo, le jour où la passerelle Free Money est branchée.
 */
export const MOYENS_PAIEMENT = [
  { code: 'wave',         label: 'Wave',         logo: logoWave },
  { code: 'orange_money', label: 'Orange Money', logo: logoOrangeMoney },
];

export default function useAbonnement() {
  const [abonnement, setAbonnement] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moyen, setMoyen] = useState(MOYENS_PAIEMENT[0].code);
  const [saving, setSaving] = useState(false);
  // L'opérateur envoie la demande de validation sur ce numéro. Celui du
  // compte est proposé, le vendeur peut en mettre un autre.
  const [telephone, setTelephone] = useState(() => getUser()?.telephone || '');
  const [erreurTelephone, setErreurTelephone] = useState(null);

  const charger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const [resAbo, resPaie] = await Promise.all([
        getMonAbonnement(),
        // L'historique n'est pas vital : son échec ne doit pas masquer la
        // formule en cours, qui est l'information principale de la page.
        getHistoriquePaiements().catch(() => ({ data: [] })),
      ]);
      setAbonnement(resAbo.data?.abonnement || resAbo.data?.data || resAbo.data || null);
      const liste = resPaie.data?.paiements || resPaie.data?.data || resPaie.data || [];
      setPaiements(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error("Erreur lors du chargement de l'abonnement");
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { charger({ initial: true }); }, [charger]);

  const renouveler = async () => {
    const numero = normaliserTelephone(telephone);
    if (!numero) {
      setErreurTelephone('Indiquez le numéro qui recevra la demande de paiement (9 chiffres).');
      return;
    }
    setErreurTelephone(null);
    setSaving(true);
    try {
      // 1. Le montant dû. Le serveur refuse ici si l'abonnement est encore
      //    actif pour plus de sept jours : son message est le bon.
      const init = await initierRenouvellement();
      const montant = Number(init.data?.montant);
      if (!Number.isFinite(montant) || montant <= 0) {
        toast.error("Le montant du renouvellement n'a pas pu être déterminé.");
        return;
      }

      // 2. La demande de paiement chez l'opérateur.
      const res = await payerAbonnement({ montant, methode: moyen, numeroTelephone: numero });

      // Orange Money rend une adresse de validation ; Wave pousse la demande
      // directement sur le téléphone.
      const url = res.data?.paymentUrl;
      if (url) {
        window.location.href = url;
        return;
      }

      toast.success(
        `Demande de ${montant.toLocaleString('fr-FR')} FCFA envoyée au ${numero}.`
        + ' Validez-la sur votre téléphone, puis actualisez cette page.',
      );
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du renouvellement');
    } finally {
      setSaving(false);
    }
  };

  const joursRestants = abonnement?.dateFin
    ? Math.max(0, Math.ceil((new Date(abonnement.dateFin) - new Date()) / 86400000))
    : 0;

  // Un abonnement marqué actif mais échu ne l'est pas : le statut serveur ne
  // se met à jour qu'au passage du cron quotidien.
  const actif = abonnement?.statut === 'actif' && joursRestants > 0;

  // « Expiré » et « révoqué » ne se valent pas : le second est une décision
  // d'un administrateur, et le vendeur doit pouvoir la lire telle quelle au
  // lieu de croire à une échéance dépassée.
  const etat = actif
    ? { label: 'Actif', variant: 'success' }
    : abonnement?.statut === 'revoque'
      ? { label: 'Révoqué', variant: 'danger' }
      : { label: 'Expiré', variant: 'danger' };

  return {
    abonnement, paiements, loading,
    joursRestants, actif, etat,
    telephone, setTelephone, erreurTelephone,
    moyen, setMoyen, saving, renouveler,
  };
}
