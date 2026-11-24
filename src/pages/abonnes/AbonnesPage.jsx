import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getAbonnes, getAbonne } from '../../service/vendeur.service';
import { toast } from '../../utils/alert';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils/formatters';

/**
 * Les clients qui suivent la boutique.
 *
 * L'accueil en donnait le nombre — « 312 clients abonnés » — sans jamais dire
 * qui. L'application mobile a la liste et la fiche de chacun depuis toujours
 * (`/vendeur/abonnes`), avec son activité : ce sont les clients qu'on prévient
 * d'une nouveauté, et ceux à qui une promotion est envoyée.
 */

// L'API répond { success, message, data } : les abonnés sont sous `data`.
// La page lisait `res.data.abonnes`, toujours vide — d'où une liste qui
// restait à « Personne ne suit encore votre boutique ».
const corps = (res) => res?.data?.data ?? res?.data ?? {};

const nomComplet = (a) => `${a.prenom || ''} ${a.nom || ''}`.trim() || a.email || 'Client';

function FicheAbonne({ id, nom, onFerme }) {
  const [fiche, setFiche] = useState(null);

  useEffect(() => {
    let vivant = true;
    getAbonne(id)
      .then((res) => { if (vivant) setFiche(corps(res)); })
      .catch(() => {
        if (!vivant) return;
        setFiche({});
        toast.error('Fiche indisponible pour le moment.');
      });
    return () => { vivant = false; };
  }, [id]);

  const a = fiche?.abonne;
  const activite = fiche?.activite;

  return (
    <Modal isOpen onClose={onFerme} title={nom} description="Client abonné à votre boutique">
      {!fiche ? <LoadingSpinner /> : (
        <div className="detail-grid">
          <div className="detail-item">
            <label>Téléphone</label>
            <span>{a?.telephone ? <a href={`tel:${a.telephone}`}>{a.telephone}</a> : '—'}</span>
          </div>
          <div className="detail-item">
            <label>Email</label><span>{a?.email || '—'}</span>
          </div>
          <div className="detail-item">
            <label>Abonné depuis</label><span>{formatDate(a?.depuis)}</span>
          </div>
          <div className="detail-item">
            <label>Alertes</label>
            <span>{a?.clocheActive ? 'Activées' : 'Désactivées'}</span>
          </div>
          <div className="detail-item">
            <label>Commandes</label><span>{activite?.commandes ?? 0}</span>
          </div>
          <div className="detail-item">
            <label>Articles commandés</label><span>{activite?.produitsCommandes ?? 0}</span>
          </div>
          <div className="detail-item">
            <label>Dernière commande</label>
            <span>{activite?.derniereCommande ? formatDateTime(activite.derniereCommande) : '—'}</span>
          </div>
          <div className="detail-item">
            <label>Fidélité</label><span>{fiche?.fidelite || '—'}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AbonnesPage() {
  const fetcher = useCallback(async () => {
    const d = corps(await getAbonnes());
    const abonnes = Array.isArray(d.abonnes) ? d.abonnes : [];
    return {
      abonnes,
      total: d.total ?? abonnes.length,
      avecCloche: d.avecCloche ?? abonnes.filter((a) => a.clocheActive).length,
    };
  }, []);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des abonnés');
  const [ouvert, setOuvert] = useState(null);

  if (loading) return <LoadingSpinner fullPage />;

  const abonnes = data?.abonnes || [];

  return (
    <div>
      <Helmet><title>Abonnés — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Abonnés</h1>
          <p>
            {abonnes.length === 0
              ? 'Personne ne suit encore votre boutique'
              : `${data.total} client${data.total > 1 ? 's' : ''} vous suivent · ${data.avecCloche} avec les alertes activées`}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Abonné depuis</th>
                <th>Alertes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {abonnes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>
                        Partagez l’adresse de votre site : les clients qui suivent votre
                        boutique sont prévenus de vos nouveautés et de vos promotions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : abonnes.map((a) => (
                <tr key={a.id}>
                  <td className="td-bold">{nomComplet(a)}</td>
                  <td className="td-muted">
                    {a.telephone ? <a href={`tel:${a.telephone}`}>{a.telephone}</a> : '—'}
                  </td>
                  <td className="td-muted">{formatDate(a.depuis)}</td>
                  <td>
                    {/* La cloche dit si ce client reçoit vos annonces : sans
                        elle, il vous suit mais n'est jamais prévenu. */}
                    <Badge variant={a.clocheActive ? 'success' : 'default'}>
                      {a.clocheActive ? 'Activées' : 'Désactivées'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setOuvert({ id: a.id, nom: nomComplet(a) })}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ouvert && (
        <FicheAbonne id={ouvert.id} nom={ouvert.nom} onFerme={() => setOuvert(null)} />
      )}
    </div>
  );
}
