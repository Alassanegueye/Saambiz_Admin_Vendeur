import Badge from '../../../components/common/Badge';
import { ETATS_VERIFICATION } from '../useBoutique';

/**
 * Vérification du profil vendeur.
 *
 * C'est ce qui donne le badge « boutique vérifiée » et met la boutique en
 * avant. Quatre états, et un seul est affiché à la fois : proposer d'envoyer
 * une pièce à quelqu'un dont le dossier est déjà en cours d'examen n'a pas de
 * sens, et produit des doublons côté administration.
 */
export default function CarteVerification({
  verif, setPiece, typePiece, setTypePiece, envoiVerif, onEnvoyer,
}) {
  const statut = verif?.statutValidation;
  const etat = ETATS_VERIFICATION[statut];

  return (
    <div className="card carte-espacee">
      <div className="card-header">
        <h3 className="card-title">Vérification du profil</h3>
        {etat && <Badge variant={etat.variant}>{etat.label}</Badge>}
      </div>

      <div className="card-body">
        {statut === 'approuve' ? (
          <p className="texte-secondaire">
            Votre profil est vérifié. Votre boutique porte le badge de confiance
            et remonte dans les sélections proposées aux clients.
          </p>
        ) : statut === 'en_attente' ? (
          <p className="texte-secondaire">
            Votre pièce a bien été reçue. Un administrateur l’examine, vous serez
            informé dès que c’est traité.
          </p>
        ) : (
          <>
            {statut === 'rejete' && verif?.motifRejet && (
              <p className="texte-refus">Demande refusée : {verif.motifRejet}</p>
            )}
            <p className="texte-secondaire">
              Transmettez une pièce d’identité ou un registre de commerce. Cette
              vérification protège les acheteurs et met votre boutique en avant.
            </p>

            <div className="form-field">
              <label className="form-label" htmlFor="v-type">Type de pièce</label>
              <select
                id="v-type"
                className="form-input"
                value={typePiece}
                onChange={(e) => setTypePiece(e.target.value)}
              >
                <option value="CNI">Carte nationale d’identité</option>
                <option value="Passeport">Passeport</option>
                <option value="Registre de commerce">Registre de commerce</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="v-piece">Photo de la pièce</label>
              <input
                id="v-piece"
                className="form-input"
                type="file"
                accept="image/*"
                onChange={(e) => setPiece(e.target.files?.[0] || null)}
              />
            </div>

            <button className="btn btn-primary" onClick={onEnvoyer} disabled={envoiVerif}>
              {envoiVerif ? 'Envoi…' : 'Envoyer pour vérification'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
