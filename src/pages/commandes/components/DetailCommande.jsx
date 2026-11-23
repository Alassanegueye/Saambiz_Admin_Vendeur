import { formatMontant, formatDateTime } from '../../../utils/formatters';
import { infoStatut, nomAcheteur, transitionsDepuis } from '../useCommandes';

/**
 * Contenu de la modale de détail : informations, lignes de la commande, et
 * les transitions possibles.
 *
 * Les boutons suivent la table de transitions du backend : seules les suites
 * qu'il accepte sont proposées. Un statut terminal n'en a aucune, et le dit
 * plutôt que de laisser un bloc vide.
 */
export default function DetailCommande({ commande, saving, onChangerStatut }) {
  if (!commande) return null;

  return (
    <>
      <div className="detail-grid">
        <div className="detail-item">
          <label>Client</label><span>{nomAcheteur(commande)}</span>
        </div>
        <div className="detail-item">
          <label>Montant</label><span>{formatMontant(commande.montantTotal)}</span>
        </div>
        <div className="detail-item">
          <label>Acompte</label>
          <span>{commande.montantAcompte ? formatMontant(commande.montantAcompte) : '—'}</span>
        </div>
        <div className="detail-item">
          <label>Livraison</label>
          <span>{commande.modeLivraison === 'retrait' ? 'Retrait' : 'Livraison'}</span>
        </div>
        <div className="detail-item">
          <label>Adresse</label><span>{commande.adresseLivraison || '—'}</span>
        </div>
        <div className="detail-item">
          <label>Passée le</label><span>{formatDateTime(commande.createdAt)}</span>
        </div>
      </div>

      {Array.isArray(commande.lignes) && commande.lignes.length > 0 && (
        <div className="table-wrap table-imbriquee">
          <table className="data-table">
            <thead>
              <tr><th>Produit</th><th>Qté</th><th>Prix</th></tr>
            </thead>
            <tbody>
              {commande.lignes.map((l, i) => (
                <tr key={l.id || i}>
                  <td>{l.produit?.nom || l.nomProduit || '—'}</td>
                  <td className="td-muted">{l.quantite}</td>
                  <td>{formatMontant(l.prixUnitaire ?? l.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(() => {
        // Seules les suites permises par le backend sont proposées : offrir les
        // autres ne menait qu'à un refus du serveur, et laissait de côté les
        // deux seules décisions possibles sur une commande en attente.
        const suites = transitionsDepuis(commande.statut);
        if (!suites.length) {
          return (
            <div className="bloc-transitions">
              <div className="form-label">Faire avancer la commande</div>
              <p className="form-hint">
                {`Cette commande est ${infoStatut(commande.statut).label.toLowerCase()} : son parcours est terminé.`}
              </p>
            </div>
          );
        }
        return (
          <div className="bloc-transitions">
            <div className="form-label">Faire avancer la commande</div>
            <div className="table-actions">
              {suites.map((s) => (
                <button
                  key={s.code}
                  className={`btn btn-sm ${s.variant === 'danger' ? 'btn-danger' : 'btn-secondary'}`}
                  disabled={saving}
                  onClick={() => onChangerStatut(commande, s.code)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </>
  );
}
