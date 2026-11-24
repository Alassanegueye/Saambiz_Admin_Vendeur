import { useState } from 'react';
import Badge from '../../../components/common/Badge';
import { ETATS_VERIFICATION } from '../useBoutique';

/**
 * Vérification du profil vendeur, dans la fenêtre « Infos de la boutique ».
 *
 * C'est ce qui donne le badge « boutique vérifiée » et met la boutique en
 * avant. Quatre états, et un seul est affiché à la fois : proposer d'envoyer
 * une pièce à quelqu'un dont le dossier est déjà en cours d'examen n'a pas de
 * sens, et produit des doublons côté administration. Le formulaire d'envoi
 * reste replié tant que le vendeur ne le demande pas.
 */
export default function CarteVerification({
  verif, piece, setPiece, typePiece, setTypePiece, envoiVerif, onEnvoyer,
}) {
  const [ouvert, setOuvert] = useState(false);
  const statut = verif?.statutValidation || 'non_soumis';
  const etat = ETATS_VERIFICATION[statut] || ETATS_VERIFICATION.non_soumis;

  return (
    <div className="infos-boutique__bloc">
      <div className="infos-boutique__ligne">
        <div>
          <strong>Vérification du profil</strong>
          <p className="form-hint">
            {statut === 'approuve' && 'Votre boutique porte le badge de confiance et remonte dans les sélections proposées aux clients.'}
            {statut === 'en_attente' && 'Votre pièce a bien été reçue. Un administrateur l’examine, vous serez informé dès que c’est traité.'}
            {(statut === 'non_soumis' || statut === 'rejete')
              && 'Une pièce d’identité ou un registre de commerce : cela rassure les acheteurs et met votre boutique en avant.'}
          </p>
        </div>
        <Badge variant={etat.variant}>{etat.label}</Badge>
      </div>

      {statut === 'rejete' && verif?.motifRejet && (
        <p className="texte-refus">Demande refusée : {verif.motifRejet}</p>
      )}

      {(statut === 'non_soumis' || statut === 'rejete') && !ouvert && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOuvert(true)}>
          {statut === 'rejete' ? 'Envoyer une nouvelle pièce' : 'Faire vérifier mon profil'}
        </button>
      )}

      {(statut === 'non_soumis' || statut === 'rejete') && ouvert && (
        <div className="infos-boutique__verif">
          <div className="form-duo">
            <div className="form-field">
              <label className="form-label" htmlFor="v-type">Type de pièce</label>
              <select
                id="v-type"
                className="form-select"
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
          </div>
          <div className="barre-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOuvert(false); setPiece(null); }}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onEnvoyer} disabled={envoiVerif || !piece}>
              {envoiVerif ? 'Envoi…' : 'Envoyer pour vérification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
