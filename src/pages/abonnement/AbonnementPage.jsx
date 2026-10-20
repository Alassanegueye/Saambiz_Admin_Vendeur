import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatMontant, formatDate, libelle } from '../../utils/formatters';
import HistoriquePaiements from './components/HistoriquePaiements';
import useAbonnement, { MOYENS_PAIEMENT } from './useAbonnement';

/** Formule du vendeur, renouvellement et paiements passés. */
export default function AbonnementPage() {
  const a = useAbonnement();

  if (a.loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Abonnement — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Abonnement</h1>
          <p>Votre formule et vos paiements</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Formule en cours</h3>
            <Badge variant={a.actif ? 'success' : 'danger'}>
              {a.actif ? 'Actif' : 'Expiré'}
            </Badge>
          </div>
          <div className="card-body">
            {a.abonnement ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Formule</label><span>{libelle(a.abonnement.type || 'premium')}</span>
                </div>
                <div className="detail-item">
                  <label>Montant</label><span>{formatMontant(a.abonnement.montant)}</span>
                </div>
                <div className="detail-item">
                  <label>Début</label><span>{formatDate(a.abonnement.dateDebut)}</span>
                </div>
                <div className="detail-item">
                  <label>Échéance</label><span>{formatDate(a.abonnement.dateFin)}</span>
                </div>
                <div className="detail-item">
                  <label>Jours restants</label>
                  {/* Une semaine ou moins : on colore, c'est le moment de
                      renouveler avant la coupure de publication. */}
                  <span className={a.joursRestants <= 7 ? 'valeur-alerte' : undefined}>
                    {a.joursRestants}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-state"><p>Aucun abonnement enregistré</p></div>
            )}

            {!a.actif && (
              <p className="texte-refus texte-espace">
                Sans abonnement actif, vous ne pouvez plus publier ni modifier de produits.
                Votre boutique et vos commandes restent accessibles.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Renouveler</h3></div>
          <div className="card-body">
            <div className="form-field">
              <label className="form-label" htmlFor="a-moyen">Moyen de paiement</label>
              <select
                id="a-moyen"
                className="form-input"
                value={a.moyen}
                onChange={(e) => a.setMoyen(e.target.value)}
              >
                {MOYENS_PAIEMENT.map((m) => (
                  <option key={m.code} value={m.code}>{m.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={a.renouveler} disabled={a.saving}>
              {a.saving ? 'Redirection…' : 'Renouveler mon abonnement'}
            </button>
            <p className="note-sous-bouton">
              Vous serez redirigé vers votre opérateur pour valider le paiement.
            </p>
          </div>
        </div>
      </div>

      <HistoriquePaiements paiements={a.paiements} />
    </div>
  );
}
