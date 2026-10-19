import { MAX_CATEGORIES } from '../useBoutique';

/** Informations de la vitrine — ce que les clients voient de la boutique. */
export default function FormBoutique({
  valeurs, setValeurs, erreurs, saving,
  boutique, logo, setLogo, onEnregistrer, categories = [],
}) {
  const majChamp = (champ) => (e) => setValeurs({ ...valeurs, [champ]: e.target.value });

  // Les valeurs peuvent être des slugs, des ids ou un ancien libellé.
  const correspond = (c, v) => [c.slug, c.id, c.nom].some((x) => x && x.toLowerCase() === String(v).toLowerCase());
  const choisies = valeurs.categories || [];
  const rang = (c) => choisies.findIndex((v) => correspond(c, v));
  const basculerCategorie = (c) => {
    const i = rang(c);
    if (i >= 0) {
      setValeurs({ ...valeurs, categories: choisies.filter((_, j) => j !== i) });
    } else if (choisies.length < MAX_CATEGORIES) {
      setValeurs({ ...valeurs, categories: [...choisies, c.slug || c.id] });
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Informations</h3></div>
      <div className="card-body">
        <div className="form-field">
          <label className="form-label" htmlFor="b-nom">Nom de la boutique</label>
          <input
            id="b-nom"
            className="form-input"
            value={valeurs.nom}
            onChange={majChamp('nom')}
          />
          {erreurs.nom && <span className="form-error">{erreurs.nom}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="b-slogan">Slogan</label>
          <input
            id="b-slogan"
            className="form-input"
            value={valeurs.slogan}
            onChange={majChamp('slogan')}
            placeholder="Une phrase qui résume votre boutique"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="b-desc">Description</label>
          <textarea
            id="b-desc"
            className="form-textarea"
            rows={4}
            value={valeurs.description}
            onChange={majChamp('description')}
          />
        </div>

        <div className="form-duo">
          <div className="form-field">
            <label className="form-label" htmlFor="b-ville">Ville</label>
            <input
              id="b-ville"
              className="form-input"
              value={valeurs.localisation}
              onChange={majChamp('localisation')}
              placeholder="Dakar"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="b-tel">Téléphone / WhatsApp</label>
            <input
              id="b-tel"
              className="form-input"
              value={valeurs.telephone}
              onChange={majChamp('telephone')}
              placeholder="+221 77 000 00 00"
            />
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Catégories de la boutique</span>
          <span className="form-hint">
            1 à {MAX_CATEGORIES} catégories. La première choisie (★) est la principale.
          </span>
          <div className="specs-puces" role="group" aria-label="Catégories de la boutique">
            {categories.map((c) => {
              const i = rang(c);
              const plein = i < 0 && choisies.length >= MAX_CATEGORIES;
              return (
                <button
                  type="button" key={c.id}
                  className={`specs-puce${i >= 0 ? ' specs-puce--on' : ''}`}
                  aria-pressed={i >= 0}
                  disabled={plein}
                  onClick={() => basculerCategorie(c)}
                >{i === 0 ? '★ ' : ''}{c.nom}</button>
              );
            })}
          </div>
          {erreurs.categories && <span className="form-error">{erreurs.categories}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="b-logo">Logo</label>
          {/* Le logo actuel disparaît dès qu'un nouveau fichier est choisi :
              afficher les deux laisserait croire qu'ils coexistent. */}
          {boutique?.logo && !logo && (
            <img src={boutique.logo} alt="Logo de la boutique" className="apercu-logo" />
          )}
          <input
            id="b-logo"
            className="form-input"
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
        </div>

        <button className="btn btn-primary" onClick={onEnregistrer} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
