import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  getNotifications, marquerNotificationLue, marquerToutesLues,
} from '../../service/notifications.service';
import { toast } from '../../utils/alert';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

/**
 * Les alertes du compte.
 *
 * Le serveur écrit la même notification pour l'application et pour le web :
 * commande reçue, abonnement qui approche de son terme, produit modéré. Le
 * mobile les affiche depuis toujours ; ici il n'y avait rien, alors que
 * l'accueil recevait déjà leur compte sans rien en faire. Un vendeur qui
 * travaille sur ordinateur ne voyait donc jamais passer une commande.
 */

/** Les cinq types du modèle backend, dits en français. */
const TYPES = {
  commande:       { label: 'Commande', variant: 'info' },
  promotion:      { label: 'Promotion', variant: 'info' },
  abonnement:     { label: 'Abonnement', variant: 'warning' },
  nouveau_produit:{ label: 'Produit', variant: 'default' },
  systeme:        { label: 'Système', variant: 'default' },
};

const infoType = (type) => TYPES[type] || { label: 'Information', variant: 'default' };

export default function NotificationsPage() {
  const fetcher = useCallback(async () => {
    const res = await getNotifications({ limit: 50 });
    return res.data?.notifications || res.data?.data || [];
  }, []);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des notifications');
  const [liste, setListe] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setListe(Array.isArray(data) ? data : []); }, [data]);

  const nonLues = liste.filter((n) => !n.lue).length;

  const lire = async (notif) => {
    if (notif.lue) return;
    // Optimiste : la notification se grise tout de suite, et revient si le
    // serveur refuse. Attendre l'aller-retour pour un simple accusé de
    // lecture rendrait la liste poussive.
    setListe((l) => l.map((n) => (n.id === notif.id ? { ...n, lue: true } : n)));
    try {
      await marquerNotificationLue(notif.id);
    } catch {
      setListe((l) => l.map((n) => (n.id === notif.id ? { ...n, lue: false } : n)));
      toast.error('Notification non marquée comme lue.');
    }
  };

  const toutLire = async () => {
    if (!nonLues) return;
    const avant = liste;
    setSaving(true);
    setListe((l) => l.map((n) => ({ ...n, lue: true })));
    try {
      await marquerToutesLues();
      toast.success('Toutes les notifications sont marquées comme lues');
    } catch {
      setListe(avant);
      toast.error('Opération impossible pour le moment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Notifications — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>
            {liste.length === 0
              ? 'Aucune notification'
              : `${liste.length} notification${liste.length > 1 ? 's' : ''}`}
            {nonLues > 0 && ` · ${nonLues} non lue${nonLues > 1 ? 's' : ''}`}
          </p>
        </div>
        {nonLues > 0 && (
          <button className="btn btn-secondary" onClick={toutLire} disabled={saving}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="card">
        {liste.length === 0 ? (
          <div className="empty-state">
            <p>Rien pour l’instant. Vos commandes et vos alertes d’abonnement apparaîtront ici.</p>
          </div>
        ) : (
          <ul className="liste-notifications">
            {liste.map((n) => {
              const type = infoType(n.type);
              return (
                <li
                  key={n.id}
                  className={`notif${n.lue ? '' : ' est-nouvelle'}`}
                  onClick={() => lire(n)}
                >
                  <div className="notif-entete">
                    <strong>{n.titre || type.label}</strong>
                    <Badge variant={type.variant}>{type.label}</Badge>
                    {!n.lue && <Badge variant="warning">Nouveau</Badge>}
                  </div>
                  <p>{n.message}</p>
                  <span className="td-muted">{formatDateTime(n.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
