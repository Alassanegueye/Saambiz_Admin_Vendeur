import { useState } from 'react';

/**
 * Options et caractéristiques du produit, remplies par le vendeur lui-même.
 *
 * La catégorie suggère des cases bien nommées (« Tailles », « Parfums »,
 * « Formats »…) ; le vendeur y tape ses valeurs (« XL », « Bissap »,
 * « 1,5 L ») et peut ajouter ses propres caractéristiques. Rien n'est
 * obligatoire : publier un produit doit rester rapide.
 *
 * Les valeurs saisies dans une case « variantes » deviennent des choix pour
 * le client au moment de commander.
 *
 * @param {Array}    specifications  suggestions de la catégorie
 * @param {object}   valeurs         { cle: valeur }
 * @param {Function} onChange        reçoit le nouvel objet de valeurs
 * @param {object}   erreurs         { cle: message }
 */
export default function ChampsSpecifications({ specifications = [], valeurs = {}, onChange, erreurs = {} }) {
  const [nouveauNom, setNouveauNom] = useState('');

  const maj = (cle, valeur) => onChange({ ...valeurs, [cle]: valeur });
  const retirer = (cle) => {
    const copie = { ...valeurs };
    delete copie[cle];
    onChange(copie);
  };

  // Caractéristiques ajoutées par le vendeur : tout ce qui n'est pas suggéré.
  const connues = new Set(specifications.map((s) => s.cle));
  const ajoutees = Object.keys(valeurs)
    .filter((cle) => !connues.has(cle))
    .map((cle) => ({
      cle,
      libelle: cle,
      type: Array.isArray(valeurs[cle]) ? 'variantes' : 'texte',
      options: [],
      libre: true,
      ajoutee: true,
    }));
  const champs = [...specifications, ...ajoutees];

  const ajouterCaracteristique = () => {
    const nom = nouveauNom.trim().slice(0, 40);
    if (!nom || champs.some((c) => c.cle.toLowerCase() === nom.toLowerCase()
      || c.libelle.toLowerCase() === nom.toLowerCase())) return;
    onChange({ ...valeurs, [nom]: [] });
    setNouveauNom('');
  };

  return (
    <fieldset className="specs">
      <legend className="specs-titre">Options du produit <span className="specs-facultatif">(facultatif)</span></legend>
      <p className="form-hint specs-intro">
        Ajoutez ce que le client pourra choisir : tailles, couleurs, parfums, formats…
        Tapez une valeur puis Entrée.
      </p>

      {champs.map((s) => (
        <div className="form-field" key={s.cle}>
          <div className="specs-entete">
            <label className="form-label" htmlFor={`spec-${s.cle}`}>
              {s.libelle}{s.obligatoire && <span className="champ-requis"> *</span>}
            </label>
            {s.ajoutee && (
              <button type="button" className="specs-retirer" onClick={() => retirer(s.cle)}>
                Retirer
              </button>
            )}
          </div>
          <Champ spec={s} valeur={valeurs[s.cle]} onChange={(v) => maj(s.cle, v)} />
          {erreurs[s.cle] && <span className="form-error">{erreurs[s.cle]}</span>}
        </div>
      ))}

      <div className="specs-nouvelle">
        <input
          className="form-input" value={nouveauNom} maxLength={40}
          placeholder="Autre option (ex. Saveur, Pointure enfant)"
          onChange={(e) => setNouveauNom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterCaracteristique(); } }}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={ajouterCaracteristique}>
          + Ajouter
        </button>
      </div>
    </fieldset>
  );
}

/** Valeur stockée → tableau (une « liste » revient en texte « a, b »). */
const enTableau = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.split(/,\s+/).map((x) => x.trim()).filter(Boolean);
  return [];
};

function Champ({ spec, valeur, onChange }) {
  const id = `spec-${spec.cle}`;
  switch (spec.type) {
    case 'variantes':
    case 'liste':
      return <Valeurs id={id} spec={spec} valeurs={enTableau(valeur)} onChange={onChange} />;
    case 'choix':
      return (
        <select id={id} className="form-input" value={valeur || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Choisir —</option>
          {(spec.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'nombre':
      return (
        <div className="specs-nombre">
          <input
            id={id} className="form-input" type="number" min="0" step="any"
            value={valeur ?? ''} onChange={(e) => onChange(e.target.value)}
          />
          {spec.unite && <span className="specs-unite">{spec.unite}</span>}
        </div>
      );
    case 'oui_non':
      return (
        <label className="specs-case">
          <input id={id} type="checkbox" checked={valeur === true || valeur === 'true'} onChange={(e) => onChange(e.target.checked)} />
          Oui
        </label>
      );
    default:
      return (
        <input
          id={id} className="form-input" value={valeur || ''} maxLength={200}
          placeholder={spec.aide || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/**
 * Valeurs d'une option : les propositions de l'admin (s'il y en a) à cocher,
 * et un champ pour taper les siennes. Une valeur choisie se retire d'un clic.
 */
function Valeurs({ id, spec, valeurs, onChange }) {
  const [saisie, setSaisie] = useState('');
  const options = spec.options || [];
  const coche = (o) => valeurs.some((v) => v.toLowerCase() === o.toLowerCase());
  const tapees = valeurs.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));
  const peutTaper = spec.libre || !options.length;

  const basculer = (o) => onChange(coche(o)
    ? valeurs.filter((v) => v.toLowerCase() !== o.toLowerCase())
    : [...valeurs, o]);

  const ajouter = () => {
    // « S, M, L » tapé d'un coup donne trois valeurs ; « 1,5 L » en reste une.
    const nouvelles = saisie.split(/,(?!\d)/).map((x) => x.trim()).filter(Boolean)
      .filter((x) => !coche(x));
    if (nouvelles.length) onChange([...valeurs, ...nouvelles]);
    setSaisie('');
  };

  return (
    <div>
      {(options.length > 0 || tapees.length > 0) && (
        <div className="specs-puces" role="group" aria-label={spec.libelle}>
          {options.map((o) => (
            <button
              type="button" key={o}
              className={`specs-puce${coche(o) ? ' specs-puce--on' : ''}`}
              aria-pressed={coche(o)}
              onClick={() => basculer(o)}
            >{o}</button>
          ))}
          {tapees.map((v) => (
            <button
              type="button" key={v}
              className="specs-puce specs-puce--on"
              title="Retirer"
              onClick={() => basculer(v)}
            >{v} <span aria-hidden="true">×</span></button>
          ))}
        </div>
      )}
      {peutTaper && (
        <div className="specs-ajout">
          <input
            id={id} className="form-input" value={saisie} maxLength={80}
            placeholder={spec.aide || 'Tapez une valeur puis Entrée'}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter(); } }}
            onBlur={ajouter}
          />
        </div>
      )}
    </div>
  );
}

/** Erreurs des champs obligatoires (définis par l'admin), avant l'envoi. */
export function verifierSpecifications(specifications = [], valeurs = {}) {
  const erreurs = {};
  for (const s of specifications) {
    if (!s.obligatoire || s.type === 'oui_non') continue;
    const v = valeurs[s.cle];
    const vide = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
    if (vide) erreurs[s.cle] = 'À renseigner';
  }
  return erreurs;
}
