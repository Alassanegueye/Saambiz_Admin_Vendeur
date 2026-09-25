import Badge from '../../../components/common/Badge';
import { formatMontant, formatDate } from '../../../utils/formatters';
import { estEnCours } from '../usePromotions';

/** Liste des promotions du vendeur. Présentation seule. */
export default function TablePromotions({ promotions, onModifier, onSupprimer }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Promotion</th>
            <th>Produit</th>
            <th>Prix promo</th>
            <th>Période</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state"><p>Aucune promotion pour l’instant</p></div>
              </td>
            </tr>
          ) : promotions.map((p) => (
            <tr key={p.id}>
              <td className="td-bold">{p.titre}</td>
              <td className="td-muted">{p.produit?.nom || '—'}</td>
              <td>{formatMontant(p.prixPromo)}</td>
              <td className="td-muted">
                {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
              </td>
              <td>
                <Badge variant={estEnCours(p) ? 'success' : 'default'}>
                  {estEnCours(p) ? 'En cours' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onModifier(p)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(p)}>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
