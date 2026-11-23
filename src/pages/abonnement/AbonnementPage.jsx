import { Helmet } from 'react-helmet';
import { Check } from 'lucide-react';
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
            <Badge variant={a.etat.variant}>{a.etat.label}</Badge>
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
            <fieldset className="form-field moyens-paiement">
              <legend className="form-label">Moyen de paiement</legend>
              <div className="moyens-paiement__liste">
                {MOYENS_PAIEMENT.map((m) => (
                  <label
                    key={m.code}
                    className={`moyen${a.moyen === m.code ? ' moyen--actif' : ''}`}
                  >
                    <input
                      type="radio"
                      name="moyen-paiement"
                      value={m.code}
                      checked={a.moyen === m.code}
                      onChange={() => a.setMoyen(m.code)}
                    />
                    <img src={m.logo} alt="" width="28" height="28" loading="lazy" decoding="async" />
                    <span>{m.label}</span>
                    {a.moyen === m.code && <Check size={15} strokeWidth={3} aria-hidden="true" />}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="form-field">
              <label className="form-label" htmlFor="tel-paiement">
                Numéro à débiter
              </label>
              <input
                id="tel-paiement"
                className="form-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="77 123 45 67"
                value={a.telephone}
                onChange={(e) => a.setTelephone(e.target.value)}
              />
              {a.erreurTelephone && <span className="form-error">{a.erreurTelephone}</span>}
            </div>
            <button className="btn btn-primary" onClick={a.renouveler} disabled={a.saving}>
              {a.saving ? 'Envoi en cours…' : 'Renouveler mon abonnement'}
            </button>
            <p className="note-sous-bouton">
              La demande de paiement arrive sur ce numéro : validez-la depuis
              votre téléphone pour que l'abonnement reparte.
            </p>
          </div>
        </div>
      </div>

      <HistoriquePaiements paiements={a.paiements} />
    </div>
  );
}
