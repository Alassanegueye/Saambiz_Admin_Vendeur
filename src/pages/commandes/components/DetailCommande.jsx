import { formatMontant, formatDateTime } from '../../../utils/formatters';
import { infoStatut, nomAcheteur, telephoneClient, transitionsDepuis } from '../useCommandes';

/**
 * Contenu de la modale de détail : informations, lignes de la commande, et
 * les transitions possibles.
 *
 * Les boutons suivent la table de transitions du backend : seules les suites
 * qu'il accepte sont proposées. Un statut terminal n'en a aucune, et le dit
 * plutôt que de laisser un bloc vide.
 */
export default function DetailCommande({
  commande, saving, onChangerStatut, onRepondreAnnulation,
}) {
  if (!commande) return null;

  // L'acheteur ne peut plus annuler seul une commande déjà engagée : il la
  // demande, et le vendeur tranche. L'application mobile le propose depuis
  // toujours ; le web ne montrait pas même qu'une demande existait, si bien
  // qu'un acheteur pouvait attendre indéfiniment une réponse.
  const annulationEnAttente = Boolean(commande.annulationDemandeeLe)
    && commande.statut !== 'annulee'
    && !commande.annulationRefusMotif;

  return (
    <>
      <div className="detail-grid">
        <div className="detail-item">
          <label>Client</label><span>{nomAcheteur(commande)}</span>
        </div>
        <div className="detail-item">
          {/* Le téléphone du client : c'est par là qu'un vendeur confirme une
              commande au Sénégal. Il était dans la réponse du serveur, et
              nulle part à l'écran. */}
          <label>Téléphone</label>
          <span>
            {telephoneClient(commande)
              ? <a href={`tel:${telephoneClient(commande)}`}>{telephoneClient(commande)}</a>
              : '—'}
          </span>
        </div>
        <div className="detail-item">
          <label>Produits</label><span>{formatMontant(commande.montantProduits)}</span>
        </div>
        <div className="detail-item">
          <label>Livraison</label>
          <span>
            {commande.modeLivraison === 'retrait'
              ? 'Retrait en boutique'
              : formatMontant(commande.fraisLivraison || 0)}
          </span>
        </div>
        <div className="detail-item">
          {/* « Acompte » n'existe pas dans le modèle : ce champ affichait un
              tiret pour toutes les commandes. Le total, lui, se lit enfin
              avec son détail au-dessus. */}
          <label>Total</label><span>{formatMontant(commande.montantTotal)}</span>
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

      {annulationEnAttente && (
        <div className="bloc-annulation">
          <div className="form-label">Annulation demandée par le client</div>
          <p className="form-hint">
            {`Demandée le ${formatDateTime(commande.annulationDemandeeLe)}.`}
            {commande.annulationMotif ? ` Motif : « ${commande.annulationMotif} »` : ' Aucun motif donné.'}
          </p>
          <div className="table-actions">
            <button
              className="btn btn-sm btn-danger"
              disabled={saving}
              onClick={() => onRepondreAnnulation(commande, { accepte: true })}
            >
              Accepter l’annulation
            </button>
            <button
              className="btn btn-sm btn-secondary"
              disabled={saving}
              onClick={() => onRepondreAnnulation(commande, { accepte: false })}
            >
              Refuser
            </button>
          </div>
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
