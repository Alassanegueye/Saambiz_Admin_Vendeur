import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from '../../utils/alert';
import { getCommandes, changerStatutCommande } from '../../service/vendeur.service';
import useDebounce from '../../hooks/useDebounce';

/**
 * Contrôleur de la page Commandes.
 *
 * Le cycle de vie d'une commande est déclaré ici, en un seul endroit : la
 * liste, le filtre et les boutons d'avancement le lisent tous. Dupliqué, il
 * finit par diverger du modèle backend et l'interface propose des transitions
 * que le serveur refuse.
 */

const PAGE_SIZE = 10;

/** Repris du modèle backend, dans l'ordre où le vendeur avance la commande. */
export const STATUTS = [
  { code: 'en_attente',     label: 'En attente',     variant: 'warning' },
  { code: 'confirmee',      label: 'Confirmée',      variant: 'info' },
  { code: 'en_preparation', label: 'En préparation', variant: 'info' },
  { code: 'prete',          label: 'Prête',          variant: 'info' },
  { code: 'en_livraison',   label: 'En livraison',   variant: 'info' },
  { code: 'livree',         label: 'Livrée',         variant: 'success' },
  { code: 'annulee',        label: 'Annulée',        variant: 'danger' },
];

export const infoStatut = (code) =>
  STATUTS.find((s) => s.code === code) || { label: code || '—', variant: 'default' };

/**
 * Le nom du client, qu'il ait un compte ou non.
 *
 * Une commande venue du site de la boutique n'a pas d'acheteur : le client a
 * commandé sans créer de compte, et ses coordonnées sont portées par la
 * commande. Le backend expose les deux cas sous une clé `client` unique — on
 * la lit en priorité, les autres formes étant conservées pour les réponses
 * plus anciennes.
 */
export const nomAcheteur = (commande) => {
  const client = commande.client;
  if (client) {
    const complet = `${client.prenom || ''} ${client.nom || ''}`.trim();
    if (complet) return complet;
  }
  if (typeof commande.acheteur === 'string') return commande.acheteur;
  const complet = `${commande.acheteur?.prenom || ''} ${commande.acheteur?.nom || ''}`.trim();
  return complet || commande.acheteur?.email || client?.telephone || '—';
};

/** Le numéro à appeler — seul moyen de joindre un client sans compte. */
export const telephoneClient = (commande) =>
  commande.client?.telephone
  || commande.acheteur?.telephone
  || commande.numeroTelephone
  || null;

export default function useCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [page, setPage] = useState(1);
  const rechercheDifferee = useDebounce(search, 300);

  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  const charger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const res = await getCommandes();
      const liste = res.data?.commandes || res.data?.data || res.data || [];
      setCommandes(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { charger({ initial: true }); }, [charger]);

  const filtres = useMemo(() => {
    const s = rechercheDifferee.toLowerCase();
    return commandes.filter((c) => {
      if (filtreStatut !== 'tous' && c.statut !== filtreStatut) return false;
      if (!s) return true;
      return String(c.reference || c.id || '').toLowerCase().includes(s)
        || nomAcheteur(c).toLowerCase().includes(s);
    });
  }, [commandes, filtreStatut, rechercheDifferee]);

  const totalPages = Math.ceil(filtres.length / PAGE_SIZE);
  const pageCourante = filtres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Toute modification du filtrage ramène en page 1 : rester en page 4 après
  // un filtre qui ne rend que 2 résultats afficherait une liste vide.
  const rechercher = (valeur) => { setSearch(valeur); setPage(1); };
  const filtrerParStatut = (code) => { setFiltreStatut(code); setPage(1); };

  const changerStatut = async (commande, statut) => {
    setSaving(true);
    try {
      await changerStatutCommande(commande.id, statut);
      toast.success(`Commande passée en « ${infoStatut(statut).label} »`);
      setDetail(null);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setSaving(false);
    }
  };

  const enAttente = commandes.filter((c) => c.statut === 'en_attente').length;

  return {
    commandes, loading, enAttente,
    pageCourante, page, totalPages, setPage,
    search, rechercher, rechercheDifferee,
    filtreStatut, filtrerParStatut,
    detail, setDetail, saving, changerStatut,
  };
}
