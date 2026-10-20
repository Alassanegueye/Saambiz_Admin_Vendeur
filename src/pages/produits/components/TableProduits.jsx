import Badge from '../../../components/common/Badge';
import { formatMontant } from '../../../utils/formatters';

/**
 * Le tableau du catalogue. Purement présentationnel : il reçoit une liste et
 * quatre rappels, il n'appelle jamais le réseau lui-même.
 */
export default function TableProduits({
  produits,
  recherche,
  onModifier,
  onBasculer,
  onDupliquer,
  onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Vues</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  {/* Deux vides différents : une recherche sans résultat n'est
                      pas un catalogue vide, et n'appelle pas la même action. */}
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Votre catalogue est vide — ajoutez votre premier produit'}
                  </p>
                </div>
              </td>
            </tr>
          ) : produits.map((p) => {
            const disponible = p.disponible ?? true;
            return (
              <tr key={p.id}>
                <td className="td-bold">
                  {p.nom}
                  {p.categorie?.nom && (
                    <div className="td-muted" style={{ fontWeight: 400, fontSize: '0.78rem' }}>
                      {p.categorie.nom}
                    </div>
                  )}
                </td>
                <td>{formatMontant(p.prix)}</td>
                <td className="td-muted">{p.quantite ?? '—'}</td>
                <td className="td-muted">{p.vues ?? 0}</td>
                <td>
                  {!disponible ? (
                    <Badge variant="default">Retiré</Badge>
                  ) : Number(p.quantite ?? 1) <= 0 ? (
                    <Badge variant="danger">Rupture</Badge>
                  ) : (
                    <Badge variant="success">En vente</Badge>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onModifier(p)}>
                      Modifier
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onBasculer(p)}>
                      {disponible ? 'Retirer' : 'Remettre'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDupliquer(p)}>
                      Dupliquer
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(p)}>
                      Supprimer
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
