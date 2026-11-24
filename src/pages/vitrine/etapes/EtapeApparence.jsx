import { MODELES, COULEURS } from '../useVitrine';

/** Mise en page des produits et couleur du site : les deux seuls choix d'apparence. */
export default function EtapeApparence({ modele, accent, onChange }) {
  const accentActuel = String(accent || '').toLowerCase();

  return (
    <>
      <p className="form-label">Comment vos produits s'affichent</p>
      <div className="vitrine-modeles">
        {MODELES.map((m) => (
          <button
            key={m.cle}
            type="button"
            className={`vitrine-modele ${modele === m.cle ? 'est-actif' : ''}`}
            onClick={() => onChange('modele', m.cle)}
            aria-pressed={modele === m.cle}
          >
            {/* Quatre blocs, disposés différemment selon le modèle : le
                quatrième ne sert qu'au croquis « Catalogue », qui a besoin
                d'une rangée de plus pour se lire comme une liste. */}
            <span className={`vitrine-modele__croquis vitrine-modele__croquis--${m.cle}`} aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <strong>{m.nom}</strong>
            <span className="vitrine-modele__resume">{m.resume}</span>
            <span className="vitrine-modele__pour">{m.pourQui}</span>
          </button>
        ))}
      </div>

      <p className="form-label vitrine-marge-haut">La couleur de votre site</p>
      <div className="vitrine-couleurs">
        {COULEURS.map((c) => (
          <button
            key={c.valeur}
            type="button"
            className={`vitrine-couleur ${accentActuel === c.valeur.toLowerCase() ? 'est-actif' : ''}`}
            style={{ '--pastille': c.valeur }}
            onClick={() => onChange('accent', c.valeur)}
            title={c.nom}
            aria-label={c.nom}
            aria-pressed={accentActuel === c.valeur.toLowerCase()}
          />
        ))}

        <label className="vitrine-couleur-libre">
          <input
            type="color"
            value={accent}
            onChange={(e) => onChange('accent', e.target.value)}
            aria-label="Choisir une autre couleur"
          />
          <span>Autre</span>
        </label>
      </div>
      <p className="form-hint">
        Une seule couleur à choisir : le site en déduit tout le reste — boutons,
        bandeaux, bordures — en gardant le texte lisible.
      </p>
    </>
  );
}
