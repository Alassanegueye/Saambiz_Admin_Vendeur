import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getMonAbonnement,
  getHistoriquePaiements,
  initierRenouvellement,
} from '../../service/vendeur.service';

/**
 * Contrôleur de la page Abonnement.
 *
 * Le renouvellement se termine hors de l'application : le backend renvoie
 * l'adresse de l'opérateur, et le vendeur y est redirigé. C'est pour ça que
 * `renouveler` peut ne jamais rendre la main.
 */

export const MOYENS_PAIEMENT = [
  { code: 'wave',         label: 'Wave' },
  { code: 'orange_money', label: 'Orange Money' },
  { code: 'free_money',   label: 'Free Money' },
];

export default function useAbonnement() {
  const [abonnement, setAbonnement] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moyen, setMoyen] = useState(MOYENS_PAIEMENT[0].code);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const res = await initierRenouvellement({ moyenPaiement: moyen });

      // Le backend renvoie l'adresse de l'opérateur : on y envoie le vendeur.
      // La page ne reprendra jamais la main dans ce cas.
      const url = res.data?.url || res.data?.paiement?.url || res.data?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }

      toast.success(res.data?.message || 'Renouvellement initié — suivez les instructions reçues.');
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

  return {
    abonnement, paiements, loading,
    joursRestants, actif,
    moyen, setMoyen, saving, renouveler,
  };
}
