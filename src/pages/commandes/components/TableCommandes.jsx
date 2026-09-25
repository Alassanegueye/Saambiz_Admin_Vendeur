import Badge from '../../../components/common/Badge';
import { formatMontant, formatDateTime } from '../../../utils/formatters';
import { infoStatut, nomAcheteur } from '../useCommandes';

/** Liste des commandes reçues. Présentation seule. */
export default function TableCommandes({ commandes, filtreActif, onDetail }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Paiement</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commandes.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">
                  {/* Un filtre sans résultat n'est pas une boutique sans
                      commande : le message ne doit pas décourager à tort. */}
                  <p>
                    {filtreActif
                      ? 'Aucune commande ne correspond à ce filtre'
                      : 'Aucune commande reçue pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : commandes.map((c) => {
            const st = infoStatut(c.statut);
            return (
              <tr key={c.id}>
                <td className="td-bold">{c.reference || `#${String(c.id).slice(0, 8)}`}</td>
                <td className="td-muted">{nomAcheteur(c)}</td>
                <td>{formatMontant(c.montantTotal)}</td>
                <td>
                  <Badge variant={c.statutPaiement === 'paye' ? 'success' : 'default'}>
                    {c.statutPaiement === 'paye' ? 'Payé' : 'Non payé'}
                  </Badge>
                </td>
                <td><Badge variant={st.variant}>{st.label}</Badge></td>
                <td className="td-muted">{formatDateTime(c.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onDetail(c)}>
                      Détail
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
