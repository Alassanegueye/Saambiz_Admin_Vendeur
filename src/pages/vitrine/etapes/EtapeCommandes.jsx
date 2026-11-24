import { useState } from 'react';
import { erreurAdresse, nettoyerAdresse } from '../../boutique/outilsSite';

/**
 * L'adresse du site et la façon d'acheter : commande en ligne ou simple
 * catalogue, paiement à la livraison. Supprimer le site se fait ici aussi,
 * à l'écart, en bas.
 */
export default function EtapeCommandes({
  valeurs, onChamp, prefixe, slugEnregistre, configuree, onSupprimer, saving,
}) {
  // L'erreur ne s'affiche qu'une fois le champ quitté — pas de rouge pendant
  // que le vendeur tape les premières lettres — et seulement pour une
  // adresse changée : l'adresse enregistrée ne part pas (voir useVitrine).
  const [touche, setTouche] = useState(false);
  const erreur = touche && valeurs.slug !== slugEnregistre ? erreurAdresse(valeurs.slug) : null;
  const adresseChangee = configuree && slugEnregistre && valeurs.slug !== slugEnregistre;

  return (
    <>
      <div className="form-field">
        <label className="form-label" htmlFor="v-slug">L'adresse de votre site</label>
        <div className={`vitrine-slug${erreur ? ' est-en-erreur' : ''}`}>
          <span>{prefixe}</span>
          <input
            id="v-slug"
            className="form-input"
            value={valeurs.slug}
            onChange={(e) => onChamp('slug', nettoyerAdresse(e.target.value))}
            // Un tiret laissé en fin de saisie (« chez-fatou- ») est retiré
            // en quittant le champ plutôt que reproché.
            onBlur={() => { setTouche(true); if (/-$/.test(valeurs.slug)) onChamp('slug', valeurs.slug.replace(/-+$/, '')); }}
            placeholder="chez-fatou"
            spellCheck="false"
            autoCapitalize="none"
            aria-invalid={Boolean(erreur)}
            aria-describedby="v-slug-aide"
          />
        </div>
        {erreur && <span className="form-error">{erreur}</span>}
        <p className="form-hint" id="v-slug-aide">
          Court et simple : c'est ce que vos clients taperont ou liront sur votre devanture.
          Les espaces et les accents sont convertis tout seuls.
        </p>
        {adresseChangee && (
          <p className="etape-site__attention" role="status">
            Attention : l'ancienne adresse <strong>{prefixe}{slugEnregistre}</strong> ne fonctionnera
            plus. Pensez à refaire vos QR codes et vos cartes.
          </p>
        )}
      </div>

      <p className="form-label vitrine-marge-haut">Comment vos clients achètent</p>
      <label className="vitrine-bascule">
        <input
          type="checkbox"
          checked={valeurs.commande}
          onChange={(e) => onChamp('commande', e.target.checked)}
        />
        <span>
          <strong>Accepter les commandes sur le site</strong>
          Vos clients commandent directement, sans créer de compte. Décochez pour
          n'afficher que votre catalogue et être contacté sur WhatsApp.
        </span>
      </label>

      <label className="vitrine-bascule">
        <input
          type="checkbox"
          checked={valeurs.paiementLivraison}
          disabled={!valeurs.commande}
          onChange={(e) => onChamp('paiementLivraison', e.target.checked)}
        />
        <span>
          <strong>Paiement à la livraison</strong>
          Le client règle en espèces à la réception. C'est ce que la plupart
          attendent ; le décocher réduit fortement les commandes.
        </span>
      </label>

      {configuree && (
        <div className="etape-site__danger">
          <div>
            <strong>Supprimer mon site</strong>
            <p className="form-hint">
              Votre site disparaît d'Internet et ses réglages sont effacés. Vos produits,
              vos commandes et votre boutique dans l'application ne sont pas touchés.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm vitrine-danger" onClick={onSupprimer} disabled={saving}>
            Supprimer mon site
          </button>
        </div>
      )}
    </>
  );
}
