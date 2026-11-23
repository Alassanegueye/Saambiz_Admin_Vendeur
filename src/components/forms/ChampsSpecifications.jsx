import { useState } from 'react';
import { enCouleurs, nomSuggere, dejaChoisie } from './couleurs';

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
  // Blocs que le vendeur a ouverts lui-même pendant cette saisie.
  const [ouverts, setOuverts] = useState(() => new Set());

  const maj = (cle, valeur) => onChange({ ...valeurs, [cle]: valeur });
  const retirer = (cle) => {
    const copie = { ...valeurs };
    delete copie[cle];
    onChange(copie);
    setOuverts((o) => { const s = new Set(o); s.delete(cle); return s; });
  };
  const ouvrir = (cle) => setOuverts((o) => new Set(o).add(cle));

  /**
   * Un bloc ne s'affiche que s'il concerne le produit.
   *
   * Tout s'affichait d'un coup : un vendeur de gâteaux voyait « Tissu », un
   * vendeur de tissu voyait « Tailles », et la page suggérait de remplir des
   * cases qui n'avaient rien à voir avec ce qu'il vend. Un bloc s'ouvre donc
   * sur demande — sauf s'il est obligatoire, ou s'il porte déjà une valeur
   * (produit en cours de modification).
   */
  const estOuvert = (s) => s.obligatoire || ouverts.has(s.cle) || !estVide(valeurs[s.cle]);

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
    // Ouvert tout de suite : une option qu'on vient de nommer et qui
    // apparaîtrait repliée donnerait l'impression de n'avoir rien ajouté.
    ouvrir(nom);
    setNouveauNom('');
  };

  return (
    <fieldset className="specs">
      <legend className="specs-titre">Options du produit <span className="specs-facultatif">(facultatif)</span></legend>
      <p className="form-hint specs-intro">
        Ajoutez ce que le client pourra choisir : tailles, couleurs, parfums, formats…
        Tapez une valeur puis Entrée.
      </p>

      {champs.map((s) => (estOuvert(s) ? (
        <div className="form-field" key={s.cle}>
          <div className="specs-entete">
            <label className="form-label" htmlFor={`spec-${s.cle}`}>
              {s.libelle}{s.obligatoire && <span className="champ-requis"> *</span>}
            </label>
            {!s.obligatoire && (
              <button type="button" className="specs-retirer" onClick={() => retirer(s.cle)}>
                Retirer
              </button>
            )}
          </div>
          <Champ spec={s} valeur={valeurs[s.cle]} onChange={(v) => maj(s.cle, v)} />
          {erreurs[s.cle] && <span className="form-error">{erreurs[s.cle]}</span>}
        </div>
      ) : (
        <div className="specs-repli" key={s.cle}>
          <div>
            <span className="specs-repli-nom">{s.libelle}</span>
            <span className="specs-repli-aide">{resume(s)}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => ouvrir(s.cle)}>
            + Ajouter
          </button>
        </div>
      )))}

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

/** Une valeur absente, vide, ou une liste sans élément. */
const estVide = (v) => v == null
  || (typeof v === 'string' && !v.trim())
  || (Array.isArray(v) && v.length === 0);

/** Ce que le bloc replié annonce, pour qu'on sache s'il nous concerne. */
function resume(spec) {
  if (spec.type === 'couleurs') return 'Palette';
  if (spec.options?.length) {
    const debut = spec.options.slice(0, 3).join(' · ');
    return spec.options.length > 3 ? `${debut}…` : debut;
  }
  return spec.aide || '';
}

/**
 * Couleurs d'un produit : une pastille par teinte, autant qu'on veut.
 *
 * Le « + » ouvre le nuancier du système — celui du téléphone ou du
 * navigateur, que le vendeur connaît déjà. Un nom est proposé d'après la
 * teinte choisie, et il reste modifiable : c'est ce nom que le client lira.
 */
function Couleurs({ id, valeurs, onChange }) {
  const [enCours, setEnCours] = useState('#0d1b3d');

  const ajouter = (code) => {
    if (dejaChoisie(valeurs, code)) return;
    onChange([...valeurs, { code, nom: nomSuggere(code) || code }]);
  };
  const renommer = (i, nom) => onChange(valeurs.map((c, j) => (j === i ? { ...c, nom } : c)));
  const enlever = (i) => onChange(valeurs.filter((_, j) => j !== i));

  return (
    <div className="couleurs">
      {valeurs.map((c, i) => (
        <span className="couleurs-puce" key={c.code || c.nom}>
          <span
            className="couleurs-pastille"
            style={c.code ? { background: c.code } : undefined}
            // Sans code, la teinte est inconnue : une pastille rayée le dit
            // mieux qu'une pastille grise, qui passerait pour du gris.
            data-sans-code={c.code ? undefined : 'true'}
            aria-hidden="true"
          />
          <input
            className="couleurs-nom" value={c.nom} maxLength={40}
            aria-label={`Nom de la couleur ${i + 1}`}
            onChange={(e) => renommer(i, e.target.value)}
          />
          <button
            type="button" className="couleurs-retirer"
            aria-label={`Retirer ${c.nom}`}
            onClick={() => enlever(i)}
          >
            ×
          </button>
        </span>
      ))}

      <label className="couleurs-plus" title="Ajouter une couleur">
        <span aria-hidden="true">+</span>
        <input
          id={id} type="color" value={enCours}
          aria-label="Choisir une couleur à ajouter"
          onChange={(e) => { setEnCours(e.target.value); ajouter(e.target.value); }}
        />
      </label>
    </div>
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
    case 'couleurs':
      return <Couleurs id={id} valeurs={enCouleurs(valeur)} onChange={onChange} />;
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

// `verifierSpecifications` est dans ./verifierSpecifications.js : un fichier
// qui exporte un composant ET une fonction casse le rafraîchissement à chaud
// de Vite, et la règle react-refresh/only-export-components le refuse.
