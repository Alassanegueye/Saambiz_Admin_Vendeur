import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { MAX_CATEGORIES } from '../useBoutique';

/**
 * Les champs des infos de la boutique — ce que les clients voient d'elle,
 * dans l'application et sur son site. Sans cadre ni bouton : la fenêtre
 * « Infos de la boutique » les porte.
 */
export default function FormBoutique({
  valeurs, setValeurs, erreurs,
  boutique, logo, setLogo, categories = [], etatCategories = 'ok', onRechargerCategories,
}) {
  const champLogo = useRef(null);
  const majChamp = (champ) => (e) => setValeurs({ ...valeurs, [champ]: e.target.value });

  // Le logo choisi se voit avant d'être envoyé. L'adresse locale est créée
  // et libérée dans le même effet (voir ApercuFichier).
  const [apercuLogo, setApercuLogo] = useState(null);
  useEffect(() => {
    if (!logo) { setApercuLogo(null); return undefined; }
    const adresse = URL.createObjectURL(logo);
    setApercuLogo(adresse);
    return () => URL.revokeObjectURL(adresse);
  }, [logo]);
  const logoAffiche = apercuLogo || boutique?.logo || null;

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
    <div className="form-boutique">
      <div className="form-boutique__logo">
        <button type="button" className="form-boutique__logo-cadre" onClick={() => champLogo.current?.click()}
          aria-label={logoAffiche ? 'Changer le logo' : 'Ajouter un logo'}>
          {logoAffiche
            ? <img src={logoAffiche} alt="Logo de la boutique" />
            : <ImagePlus size={26} strokeWidth={1.8} aria-hidden="true" />}
        </button>
        <div>
          <span className="form-label">Logo</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => champLogo.current?.click()}>
            {logoAffiche ? 'Changer le logo' : 'Ajouter un logo'}
          </button>
          {logo && (
            <button type="button" className="btn btn-ghost btn-sm form-boutique__annuler-logo" onClick={() => setLogo(null)}>
              Garder l’ancien
            </button>
          )}
          <p className="form-hint">Une image carrée de préférence (JPEG ou PNG).</p>
        </div>
        <input
          ref={champLogo}
          id="b-logo"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { setLogo(e.target.files?.[0] || null); e.target.value = ''; }}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="b-nom">Nom de la boutique <span className="champ-requis">*</span></label>
        <input
          id="b-nom"
          className={`form-input${erreurs.nom ? ' input-error' : ''}`}
          value={valeurs.nom}
          onChange={majChamp('nom')}
          placeholder="Boutique Awa"
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
          rows={3}
          value={valeurs.description}
          onChange={majChamp('description')}
          placeholder="Ce que vous vendez, ce qui vous distingue…"
        />
      </div>

      <div className="form-duo">
        <div className="form-field">
          <label className="form-label" htmlFor="b-ville">Ville / quartier</label>
          <input
            id="b-ville"
            className="form-input"
            value={valeurs.localisation}
            onChange={majChamp('localisation')}
            placeholder="Sacré-Cœur, Dakar"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="b-tel">Téléphone / WhatsApp</label>
          <input
            id="b-tel"
            className="form-input"
            type="tel"
            value={valeurs.telephone}
            onChange={majChamp('telephone')}
            placeholder="+221 77 000 00 00"
          />
        </div>
      </div>

      <div className="form-field">
        <span className="form-label">Catégories de la boutique <span className="champ-requis">*</span></span>
        <span className="form-hint">
          1 à {MAX_CATEGORIES} catégories. La première choisie (★) est la principale.
        </span>
        <div className="specs-puces" role="group" aria-label="Catégories de la boutique">
          {etatCategories === 'chargement' && <span className="form-hint">Chargement des catégories…</span>}
          {etatCategories === 'erreur' && (
            <span className="form-hint">
              Impossible de charger les catégories.{' '}
              <button type="button" className="btn btn-ghost btn-sm" onClick={onRechargerCategories}>Réessayer</button>
            </span>
          )}
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
    </div>
  );
}
