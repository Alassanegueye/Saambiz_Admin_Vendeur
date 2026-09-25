import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getDashboard } from '../../service/vendeur.service';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MiniBarChart from '../../components/common/MiniBarChart';
import Badge from '../../components/common/Badge';
import { formatMontant, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const ICONS = {
  ca: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  commandes: <><path d="M9 11V6a3 3 0 0 1 6 0v5" /><rect x="3" y="11" width="18" height="10" rx="2" /></>,
  attente: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
  produits: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></>,
  vues: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  abonnes: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
};

function StatCard({ icon, tone, valeur, libelle }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${tone}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
             strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div className="stat-card-value">{valeur}</div>
      <div className="stat-card-label">{libelle}</div>
    </div>
  );
}

export default function DashboardPage() {
  const fetcher = useCallback(async () => {
    const res = await getDashboard();
    return res.data?.data || res.data || {};
  }, []);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement du tableau de bord');

  if (loading) return <LoadingSpinner fullPage />;

  const stats = data?.stats || {};
  const boutique = data?.boutique;
  const abonnement = data?.abonnement;
  const revenus = data?.revenus7Jours || [];
  const topProduits = data?.topProduits || [];

  // Le graphe partagé lit les clés qu'on lui indique : on abrège la date.
  const donneesGraphe = revenus.map((r) => ({
    jour: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    montant: Number(r.montant) || 0,
  }));

  return (
    <div>
      <Helmet><title>Tableau de bord — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>{boutique?.nom || 'Ma boutique'}</h1>
          <p>{boutique?.localisation ? `Boutique à ${boutique.localisation}` : 'Votre activité en un coup d’œil'}</p>
        </div>
      </div>

      {/* Sans boutique, rien d'autre n'a de sens : on renvoie d'abord la créer. */}
      {!boutique && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <h3 className="card-title">Vous n’avez pas encore de boutique</h3>
            <p style={{ margin: '8px 0 16px', color: 'var(--color-text-muted)' }}>
              Créez votre boutique pour publier vos produits et recevoir des commandes.
            </p>
            <Link className="btn btn-primary" to={ROUTES.BOUTIQUE}>
              Créer ma boutique
            </Link>
          </div>
        </div>
      )}

      {abonnement && abonnement.joursRestants <= 7 && (
        <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--color-warning)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <strong>Votre abonnement expire dans {abonnement.joursRestants} jour
                {abonnement.joursRestants > 1 ? 's' : ''}</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Sans abonnement actif, vous ne pouvez plus publier ni modifier de produits.
              </p>
            </div>
            <Link className="btn btn-primary" to={ROUTES.ABONNEMENT}>Renouveler</Link>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon={ICONS.ca}        tone="green" valeur={formatMontant(stats.chiffreAffaires)} libelle="Chiffre d'affaires" />
        <StatCard icon={ICONS.commandes} tone="blue"  valeur={stats.nombreCommandes ?? 0}          libelle="Commandes reçues" />
        <StatCard icon={ICONS.attente}   tone="gold"  valeur={stats.commandesEnAttente ?? 0}       libelle="En attente de traitement" />
        <StatCard icon={ICONS.produits}  tone="blue"  valeur={stats.nombreProduits ?? 0}           libelle="Produits publiés" />
        <StatCard icon={ICONS.vues}      tone="gray"  valeur={stats.totalVues ?? 0}                libelle="Vues cumulées" />
        <StatCard icon={ICONS.abonnes}   tone="red"   valeur={stats.nombreAbonnes ?? 0}            libelle="Abonnés à la boutique" />
      </div>

      <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenus des 7 derniers jours</h3>
          </div>
          <div className="card-body">
            <MiniBarChart
              data={donneesGraphe}
              labelKey="jour"
              valueKey="montant"
              formatValue={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Produits les plus vus</h3>
            <Link className="btn btn-ghost btn-sm" to={ROUTES.PRODUITS}>Tout voir</Link>
          </div>
          <div className="card-body">
            {topProduits.length === 0 ? (
              <div className="empty-state"><p>Aucun produit publié pour l’instant</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Produit</th><th>Prix</th><th>Vues</th></tr>
                  </thead>
                  <tbody>
                    {topProduits.map((p) => (
                      <tr key={p.id}>
                        <td className="td-bold">{p.nom}</td>
                        <td>{formatMontant(p.prix)}</td>
                        <td className="td-muted">{p.vues ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Abonnement</h3></div>
          <div className="card-body">
            {abonnement ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Statut</label>
                  <Badge variant={abonnement.statut === 'actif' ? 'success' : 'warning'}>
                    {abonnement.statut}
                  </Badge>
                </div>
                <div className="detail-item"><label>Formule</label><span>{abonnement.type || '—'}</span></div>
                <div className="detail-item"><label>Échéance</label><span>{formatDate(abonnement.dateFin)}</span></div>
                <div className="detail-item"><label>Jours restants</label><span>{abonnement.joursRestants}</span></div>
              </div>
            ) : (
              <div className="empty-state"><p>Aucun abonnement enregistré</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">À traiter</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Commandes en attente</label>
                <span><Link to={ROUTES.COMMANDES}>{stats.commandesEnAttente ?? 0}</Link></span>
              </div>
              <div className="detail-item">
                <label>Messages non lus</label>
                <span><Link to={ROUTES.MESSAGES}>{data?.messagesNonLus ?? 0}</Link></span>
              </div>
              <div className="detail-item">
                <label>Notifications non lues</label>
                <span>{data?.notificationsNonLues ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
