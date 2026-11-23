import Badge from '../../../components/common/Badge';
import { formatMontant, formatDateTime } from '../../../utils/formatters';
import { infoPaiement, nomMoyen } from '../statutPaiement';

/** Paiements passés de l'abonnement. Présentation seule. */
export default function HistoriquePaiements({ paiements }) {
  return (
    <div className="card carte-espacee">
      <div className="card-header"><h3 className="card-title">Historique des paiements</h3></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Montant</th><th>Moyen</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {paiements.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state"><p>Aucun paiement enregistré</p></div>
                </td>
              </tr>
            ) : paiements.map((p) => (
              <tr key={p.id}>
                <td className="td-muted">{formatDateTime(p.createdAt || p.datePaiement)}</td>
                <td className="td-bold">{formatMontant(p.montant)}</td>
                <td className="td-muted">{nomMoyen(p.methode || p.moyenPaiement)}</td>
                <td>
                  <Badge variant={infoPaiement(p.statut).variant}>
                    {infoPaiement(p.statut).label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
