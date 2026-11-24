import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react';

/** Vignette légère d'une photo Cloudinary ; une autre adresse reste telle quelle. */
function vignette(url) {
  const u = String(url || '');
  const i = u.indexOf('/upload/');
  if (i < 0 || !/^https:\/\/res\.cloudinary\.com\//i.test(u)) return u;
  return `${u.slice(0, i + 8)}f_auto,q_auto,c_fill,w_480,h_270/${u.slice(i + 8)}`;
}

/**
 * Les photos du haut du site. Elles défilent toutes seules, en boucle, dans
 * le grand bandeau de l'accueil, dans l'ordre choisi ici. Sans photo, le
 * bandeau prend les couleurs de la boutique.
 *
 * Contrairement aux autres étapes, rien n'attend « Enregistrer » : une photo
 * est sur le site dès qu'elle est envoyée.
 */
export default function EtapePhotos({ photos, max, occupe, onAjouter, onRetirer, onDeplacer }) {
  const champ = useRef(null);
  const [survol, setSurvol] = useState(false);
  const plein = photos.length >= max;

  const deposer = (e) => {
    e.preventDefault();
    setSurvol(false);
    if (!plein && !occupe) onAjouter(e.dataTransfer.files);
  };

  return (
    <>
      <p className="etape-site__intro">
        Elles défilent toutes seules, en boucle, en haut de votre page d'accueil.
        <span className="vitrine-photos__compte">{photos.length} / {max}</span>
      </p>

      {photos.length > 0 && (
        <ol className="vitrine-photos" aria-label="Ordre de défilement">
          {photos.map((p, i) => (
            <li key={p.id} className="vitrine-photo">
              <img src={vignette(p.url)} alt={`Photo ${i + 1}`} loading="lazy" />
              <span className="vitrine-photo__rang">{i === 0 ? 'En premier' : i + 1}</span>
              <div className="vitrine-photo__outils">
                <button type="button" className="vitrine-photo__bouton" onClick={() => onDeplacer(i, -1)}
                  disabled={occupe || i === 0} aria-label={`Avancer la photo ${i + 1}`} title="Avancer">
                  <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button type="button" className="vitrine-photo__bouton" onClick={() => onDeplacer(i, 1)}
                  disabled={occupe || i === photos.length - 1} aria-label={`Reculer la photo ${i + 1}`} title="Reculer">
                  <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button type="button" className="vitrine-photo__bouton vitrine-photo__bouton--retirer"
                  onClick={() => onRetirer(p)} disabled={occupe} aria-label={`Retirer la photo ${i + 1}`} title="Retirer">
                  <X size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div
        className={`vitrine-depot${survol ? ' est-survole' : ''}${plein ? ' est-plein' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!plein) setSurvol(true); }}
        onDragLeave={() => setSurvol(false)}
        onDrop={deposer}
      >
        <ImagePlus size={26} strokeWidth={1.8} aria-hidden="true" />
        {plein ? (
          <p>
            <strong>{max} photos, c'est le maximum.</strong> Retirez-en une pour en ajouter une autre.
          </p>
        ) : (
          <>
            <p>
              {photos.length
                ? <><strong>Ajoutez d'autres photos</strong> : glissez-les ici, ou</>
                : <><strong>Aucune photo pour l'instant</strong> : le haut de votre site prend votre couleur. Glissez des photos ici, ou</>}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => champ.current?.click()} disabled={occupe}>
              {occupe ? 'Envoi en cours…' : 'Choisir des photos'}
            </button>
          </>
        )}
        <input
          ref={champ}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          hidden
          onChange={(e) => { onAjouter(e.target.files); e.target.value = ''; }}
        />
      </div>

      <p className="form-hint">
        Des photos en largeur (paysage), JPEG ou PNG, 5 Mo au plus chacune : votre boutique,
        vos produits mis en scène, votre équipe. <strong>Elles sont enregistrées dès l'envoi</strong>,
        sans avoir à cliquer sur « Enregistrer ».
      </p>
    </>
  );
}
