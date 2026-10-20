import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getDashboard } from '../../service/vendeur.service';
import usePageData from '../../hooks/usePageData';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MiniBarChart from '../../components/common/MiniBarChart';
import Badge from '../../components/common/Badge';
import { formatMontant, formatDate, libelle } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const ICONES = {
  ca: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  commandes: <><path d="M9 11V6a3 3 0 0 1 6 0v5" /><rect x="3" y="11" width="18" height="10" rx="2" /></>,
  attente: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
  produits: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></>,
  vues: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  abonnes: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
  message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
  boutique: <><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M9 21v-6h6v6" /></>,
  alerte: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  ok: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  site: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
};

const Icone = ({ children, taille = 20 }) => (
  <svg viewBox="0 0 24 24" width={taille} height={taille} fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

/** Chiffre clé ; avec `to`, la carte ouvre la liste concernée. */
function CarteChiffre({ icone, ton, valeur, libelle, to }) {
  const contenu = (
    <>
      <div className={`stat-card-icon ${ton}`}><Icone>{icone}</Icone></div>
      <div className="stat-card-value">{valeur}</div>
      <div className="stat-card-label">{libelle}</div>
      {to && <span className="stat-card-lien-texte">Voir →</span>}
    </>
  );
  return to
    ? <Link to={to} className="stat-card stat-card-lien">{contenu}</Link>
    : <div className="stat-card">{contenu}</div>;
}

const pluriel = (n, mot, motPluriel = `${mot}s`) => `${n} ${n > 1 ? motPluriel : mot}`;

/**
 * Ce que le vendeur doit faire maintenant, du plus urgent au moins urgent.
 * Une seule phrase et un seul bouton par ligne : pas de jargon.
 */
function tachesDuJour({ boutique, stats, abonnement, messagesNonLus }) {
  const t = [];
  if (!boutique) {
    t.push({ ton: 'urgent', icone: ICONES.boutique, texte: 'Créez votre boutique pour commencer à vendre', bouton: 'Créer ma boutique', to: ROUTES.BOUTIQUE });
    return t;
  }
  const attente = stats.commandesEnAttente ?? 0;
  if (attente > 0) {
    t.push({ ton: 'urgent', icone: ICONES.attente, texte: `${pluriel(attente, 'commande')} à confirmer`, aide: 'Vos clients attendent votre réponse', bouton: 'Voir', to: `${ROUTES.COMMANDES}?statut=en_attente` });
  }
  if (abonnement && abonnement.joursRestants <= 7) {
    t.push({
      ton: abonnement.joursRestants <= 2 ? 'urgent' : 'attention',
      icone: ICONES.alerte,
      texte: abonnement.joursRestants > 0
        ? `Votre abonnement se termine dans ${pluriel(abonnement.joursRestants, 'jour')}`
        : 'Votre abonnement est terminé',
      aide: 'Sans abonnement, vous ne pouvez plus publier ni modifier vos produits',
      bouton: 'Renouveler', to: ROUTES.ABONNEMENT,
    });
  }
  if ((messagesNonLus ?? 0) > 0) {
    t.push({ ton: 'attention', icone: ICONES.message, texte: `${pluriel(messagesNonLus, 'message non lu', 'messages non lus')}`, bouton: 'Lire', to: ROUTES.MESSAGES });
  }
  if ((stats.nombreProduits ?? 0) === 0) {
    t.push({ ton: 'attention', icone: ICONES.produits, texte: 'Ajoutez votre premier produit', aide: 'Vos clients ne voient encore rien dans votre boutique', bouton: 'Ajouter', to: `${ROUTES.PRODUITS}?nouveau=1` });
  }
  return t;
}

export default function DashboardPage() {
  const { user } = useAuth();
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
  const taches = tachesDuJour({ boutique, stats, abonnement, messagesNonLus: data?.messagesNonLus });

  const donneesGraphe = revenus.map((r) => ({
    jour: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    montant: Number(r.montant) || 0,
  }));
  const totalSemaine = donneesGraphe.reduce((t, r) => t + r.montant, 0);

  return (
    <div>
      <Helmet><title>Accueil — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Bonjour{user?.prenom ? ` ${user.prenom}` : ''}</h1>
          <p>{boutique ? `Voici où en est ${boutique.nom}` : 'Bienvenue sur votre espace vendeur'}</p>
        </div>
        {boutique && (
          <div className="actions-rapides">
            <Link className="btn btn-secondary" to={ROUTES.VITRINE}>
              <Icone taille={16}>{ICONES.site}</Icone> Mon site
            </Link>
            <Link className="btn btn-primary" to={`${ROUTES.PRODUITS}?nouveau=1`}>
              <Icone taille={16}>{ICONES.plus}</Icone> Ajouter un produit
            </Link>
          </div>
        )}
      </div>

      {/* À faire : la première chose à regarder en arrivant. */}
      <div className="card bloc-taches">
        <div className="card-header"><span className="card-title">À faire</span></div>
        {taches.length === 0 ? (
          <div className="tache tache-ok">
            <span className="tache-icone"><Icone>{ICONES.ok}</Icone></span>
            <div className="tache-texte">
              <strong>Tout est à jour</strong>
              <span>Aucune commande à confirmer, aucun message en attente.</span>
            </div>
          </div>
        ) : taches.map((t) => (
          <div className={`tache tache-${t.ton}`} key={t.texte}>
            <span className="tache-icone"><Icone>{t.icone}</Icone></span>
            <div className="tache-texte">
              <strong>{t.texte}</strong>
              {t.aide && <span>{t.aide}</span>}
            </div>
            <Link className="btn btn-primary btn-sm" to={t.to}>{t.bouton}</Link>
          </div>
        ))}
      </div>

      {boutique && (
        <>
          <div className="stats-grid stats-grid-3">
            <CarteChiffre icone={ICONES.ca} ton="green" valeur={formatMontant(stats.chiffreAffaires)} libelle="Ventes encaissées" to={`${ROUTES.COMMANDES}?statut=livree`} />
            <CarteChiffre icone={ICONES.commandes} ton="blue" valeur={stats.nombreCommandes ?? 0} libelle="Commandes reçues" to={ROUTES.COMMANDES} />
            <CarteChiffre icone={ICONES.attente} ton="gold" valeur={stats.commandesEnAttente ?? 0} libelle="Commandes à confirmer" to={`${ROUTES.COMMANDES}?statut=en_attente`} />
            <CarteChiffre icone={ICONES.produits} ton="blue" valeur={stats.nombreProduits ?? 0} libelle="Produits en ligne" to={ROUTES.PRODUITS} />
            <CarteChiffre icone={ICONES.vues} ton="gray" valeur={stats.totalVues ?? 0} libelle="Visites de vos produits" />
            <CarteChiffre icone={ICONES.abonnes} ton="red" valeur={stats.nombreAbonnes ?? 0} libelle="Clients abonnés à votre boutique" />
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ventes des 7 derniers jours</span>
                <span className="td-bold">{formatMontant(totalSemaine)}</span>
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
                <span className="card-title">Vos produits les plus regardés</span>
                <Link className="lien-voir-tout" to={ROUTES.PRODUITS}>Voir tout</Link>
              </div>
              {topProduits.length === 0 ? (
                <div className="empty-state"><p>Aucun produit publié pour l’instant</p></div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Produit</th><th>Prix</th><th>Vues</th></tr></thead>
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

          <div className="card carte-abonnement">
            <div className="card-header">
              <span className="card-title">Mon abonnement</span>
              <Link className="lien-voir-tout" to={ROUTES.ABONNEMENT}>Gérer</Link>
            </div>
            {abonnement ? (
              <div className="ligne-abonnement">
                <Badge variant={abonnement.statut === 'actif' ? 'success' : 'warning'}>
                  {libelle(abonnement.statut)}
                </Badge>
                <span>Formule <strong>{libelle(abonnement.type)}</strong></span>
                <span>Jusqu’au <strong>{formatDate(abonnement.dateFin)}</strong></span>
                <span className="td-muted">{pluriel(abonnement.joursRestants ?? 0, 'jour restant', 'jours restants')}</span>
              </div>
            ) : (
              <div className="empty-state"><p>Aucun abonnement enregistré</p></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
