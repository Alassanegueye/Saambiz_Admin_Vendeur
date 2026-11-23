/**
 * Suppression du compte par son propriétaire.
 *
 * L'application mobile la propose depuis le profil — Google Play l'exige de
 * toute application qui crée des comptes — et le web ne l'offrait nulle part :
 * un vendeur voulant partir devait ouvrir l'application ou écrire au support.
 *
 * Le serveur refuse en 409 tant qu'une commande est en cours : son message est
 * alors le bon, on le relaie tel quel.
 */
export default function SupprimerCompte({ suppression, onSupprimer }) {
  return (
    <div className="card carte-danger">
      <div className="card-header"><h3 className="card-title">Supprimer mon compte</h3></div>
      <div className="card-body">
        <p className="form-hint">
          Votre compte, votre boutique et vos produits seront supprimés. Vos
          commandes en cours doivent d’abord être terminées. Cette action est
          définitive : elle ne peut pas être annulée.
        </p>
        <button
          type="button"
          className="btn btn-danger"
          disabled={suppression}
          onClick={onSupprimer}
        >
          {suppression ? 'Suppression…' : 'Supprimer définitivement mon compte'}
        </button>
      </div>
    </div>
  );
}
