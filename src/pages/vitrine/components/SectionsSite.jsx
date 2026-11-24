import { useState } from 'react';
import { ArrowDown, ArrowUp, ImageOff, Plus } from 'lucide-react';
import { MAX_SECTIONS, nouvelIdSection, pluriel } from '../../boutique/outilsSite';

/** Noms proposés d'un clic : le vendeur n'a pas à inventer le premier. */
const SUGGESTIONS = ['Nouveautés', 'Meilleures ventes', 'Promotions', 'Nouvelle collection', 'Coups de cœur'];

const VIGNETTES_MAX = 6;

/**
 * Les sections du site et leurs produits, au même endroit.
 *
 * Avant, on créait une section dans « Mon site », on enregistrait, puis on
 * allait choisir ses produits dans une autre page. Ici, une section créée
 * ouvre aussitôt la liste des produits à cocher ; le site n'affiche que ces
 * sections, dans cet ordre, et une section vide reste invisible.
 */
export default function SectionsSite({ sections, onChange, produits, onChoisir }) {
  const [nouvelleId, setNouvelleId] = useState(null);
  const parId = new Map((produits || []).map((p) => [p.id, p]));
  const plein = sections.length >= MAX_SECTIONS;
  const titres = new Set(sections.map((s) => s.titre.trim().toLowerCase()));
  const suggestions = SUGGESTIONS.filter((t) => !titres.has(t.toLowerCase()));

  const maj = (i, champ, valeur) => onChange(sections.map((s, j) => (j === i ? { ...s, [champ]: valeur } : s)));
  const retirer = (i) => onChange(sections.filter((_, j) => j !== i));
  const deplacer = (i, sens) => {
    const j = i + sens;
    if (j < 0 || j >= sections.length) return;
    const copie = [...sections];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onChange(copie);
  };

  /** Crée la section ; un nom proposé ouvre tout de suite le choix des produits. */
  const ajouter = (titre) => {
    if (plein) return;
    const id = nouvelIdSection();
    onChange([...sections, { id, titre: titre || 'Nouvelle section', produitIds: [] }]);
    if (titre) onChoisir(sections.length);
    else setNouvelleId(id);
  };

  return (
    <>
      <p className="etape-site__intro">
        Votre site montre vos produits par sections, dans cet ordre. Une section sans produit
        n'apparaît pas pour vos clients.
      </p>

      {sections.length === 0 ? (
        <div className="vitrine-vide">
          <p><strong>Aucune section pour l'instant : votre site ne montre aucun produit.</strong></p>
          <p className="form-hint">Commencez par « Nouveautés » ci-dessous : vous cocherez ensuite les produits à y mettre.</p>
        </div>
      ) : (
        <ol className="sections-site">
          {sections.map((s, i) => {
            const ids = s.produitIds || [];
            const montres = ids.map((id) => parId.get(id)).filter(Boolean).slice(0, VIGNETTES_MAX);
            return (
              <li key={s.id} className={`section-site${ids.length ? '' : ' est-vide'}`}>
                <div className="section-site__haut">
                  <span className="section-site__rang" aria-hidden="true">{i + 1}</span>
                  <input
                    className="form-input section-site__nom"
                    value={s.titre}
                    maxLength={60}
                    onChange={(e) => maj(i, 'titre', e.target.value)}
                    onFocus={(e) => { if (s.id === nouvelleId) e.target.select(); }}
                    // Section ajoutée avec « Autre nom… » : son nom est prêt
                    // à être remplacé.
                    autoFocus={s.id === nouvelleId}
                    aria-label={`Nom de la section ${i + 1}`}
                    placeholder="Nom de la section"
                  />
                  <div className="section-site__ordre">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, -1)}
                      disabled={i === 0} aria-label={`Monter la section ${s.titre}`} title="Monter">
                      <ArrowUp size={14} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, 1)}
                      disabled={i === sections.length - 1} aria-label={`Descendre la section ${s.titre}`} title="Descendre">
                      <ArrowDown size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="section-site__bas">
                  {ids.length === 0 ? (
                    <span className="section-site__vide">Aucun produit — invisible pour vos clients</span>
                  ) : (
                    <div className="section-site__produits">
                      {montres.map((p) => (p.image
                        ? <img key={p.id} src={p.image} alt={p.nom} title={p.nom} className="section-site__vignette" loading="lazy" />
                        : (
                          <span key={p.id} className="section-site__vignette section-site__vignette--vide" title={p.nom}>
                            <ImageOff size={14} aria-hidden="true" />
                          </span>
                        )))}
                      <span className="section-site__compte">{pluriel(ids.length, 'produit')}</span>
                    </div>
                  )}
                  <div className="section-site__actions">
                    <button type="button" className={`btn btn-sm ${ids.length ? 'btn-secondary' : 'btn-primary'}`} onClick={() => onChoisir(i)}>
                      {ids.length ? 'Modifier les produits' : 'Choisir les produits'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm vitrine-danger" onClick={() => retirer(i)}
                      aria-label={`Supprimer la section ${s.titre}`}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {plein ? (
        <p className="form-hint">{MAX_SECTIONS} sections, c'est le maximum.</p>
      ) : (
        <>
          <p className="form-label vitrine-marge-haut">Ajouter une section</p>
          <div className="vitrine-suggestions">
            {suggestions.map((t) => (
              <button key={t} type="button" className="vitrine-suggestion" onClick={() => ajouter(t)}>
                <Plus size={15} aria-hidden="true" /> {t}
              </button>
            ))}
            <button type="button" className="vitrine-suggestion" onClick={() => ajouter('')}>
              <Plus size={15} aria-hidden="true" /> Autre nom…
            </button>
          </div>
        </>
      )}
    </>
  );
}
