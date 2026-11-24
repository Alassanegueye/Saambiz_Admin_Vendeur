import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { enCouleurs, nomSuggere, NUANCIER, codeDuNom } from './couleurs';
import { optionsProposees, dansLOrdre } from './tailles';

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
 * @param {string}   categorie       slug de la catégorie (tailles proposées)
 */
export default function ChampsSpecifications({ specifications = [], valeurs = {}, onChange, erreurs = {}, categorie }) {
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
          <Champ spec={s} categorie={categorie} valeur={valeurs[s.cle]} onChange={(v) => maj(s.cle, v)} />
          {erreurs[s.cle] && <span className="form-error">{erreurs[s.cle]}</span>}
        </div>
      ) : (
        <div className="specs-repli" key={s.cle}>
          <div>
            <span className="specs-repli-nom">{s.libelle}</span>
            <span className="specs-repli-aide">{resume(s, categorie)}</span>
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

/** Un champ de couleurs, qu'il soit déclaré comme tel ou resté en variantes. */
const estCouleurs = (spec) => spec.type === 'couleurs'
  || (['variantes', 'liste'].includes(spec.type) && spec.cle === 'couleurs' && !spec.options?.length);

/** Ce que le bloc replié annonce, pour qu'on sache s'il nous concerne. */
function resume(spec, categorie) {
  if (estCouleurs(spec)) return 'Pastilles de couleur et grande palette';
  const options = optionsProposees(spec, categorie);
  if (options.length) {
    const debut = options.slice(0, 4).join(' · ');
    return options.length > 4 ? `${debut}…` : debut;
  }
  return spec.aide || '';
}

/**
 * Couleurs d'un produit, à toucher du doigt.
 *
 * Les teintes courantes sont des pastilles : un clic la choisit, un second
 * la retire. Pour une teinte absente, « Autre couleur » ouvre la grande
 * palette du système (téléphone ou navigateur). Un nom est proposé d'après
 * la teinte et reste modifiable : c'est ce nom que le client lira.
 *
 * `enNoms` : la catégorie déclare encore ses couleurs comme de simples
 * variantes (du texte). On garde alors des noms — c'est ce que l'API et
 * l'application mobile attendent pour ce champ — et la pastille se retrouve
 * par le nom.
 */
function Couleurs({ id, valeur, onChange, enNoms = false }) {
  const palette = useRef(null);
  const liste = enNoms
    ? enTableau(valeur).map((nom) => ({ nom, code: codeDuNom(nom) }))
    : enCouleurs(valeur);

  const emettre = (l) => onChange(enNoms
    ? l.map((c) => c.nom)
    : l.map((c) => (c.code ? { code: c.code, nom: c.nom } : { nom: c.nom })));
  const meme = (a, b) => (a.code && b.code && a.code.toLowerCase() === b.code.toLowerCase())
    || a.nom.trim().toLowerCase() === b.nom.trim().toLowerCase();
  const choisie = (c) => liste.some((x) => meme(x, c));

  const basculer = (c) => emettre(choisie(c) ? liste.filter((x) => !meme(x, c)) : [...liste, c]);
  const renommer = (i, nom) => emettre(liste.map((c, j) => (j === i ? { ...c, nom } : c)));
  const enlever = (i) => emettre(liste.filter((_, j) => j !== i));

  // La palette du système prévient à sa fermeture (« change ») ; l'évènement
  // « input » de React, lui, tombe à chaque mouvement de la souris et
  // ajoutait une couleur par position traversée.
  const ajouterRef = useRef(null);
  useEffect(() => {
    ajouterRef.current = (code) => {
      const nouvelle = { code: code.toLowerCase(), nom: nomSuggere(code) || code };
      if (!choisie(nouvelle)) emettre([...liste, nouvelle]);
    };
  });
  useEffect(() => {
    const champ = palette.current;
    if (!champ) return undefined;
    const choisir = (e) => ajouterRef.current?.(e.target.value);
    champ.addEventListener('change', choisir);
    return () => champ.removeEventListener('change', choisir);
  }, []);

  return (
    <div className="couleurs-choix">
      {liste.length > 0 && (
        <div className="couleurs">
          {liste.map((c, i) => (
            <span className="couleurs-puce" key={`${c.code || ''}-${i}`}>
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
        </div>
      )}

      <p className="form-hint couleurs-consigne">
        {liste.length ? 'Touchez une pastille pour l’ajouter ou la retirer :' : 'Touchez les couleurs disponibles :'}
      </p>
      <div className="nuancier" role="group" aria-label="Couleurs proposées">
        {NUANCIER.map((c) => {
          const on = choisie(c);
          return (
            <button
              type="button" key={c.code}
              className={`nuancier-pastille${on ? ' est-choisie' : ''}${c.code === '#ffffff' || c.code === '#f5f0e1' ? ' est-claire' : ''}`}
              style={{ '--teinte': c.code }}
              title={c.nom}
              aria-label={c.nom}
              aria-pressed={on}
              onClick={() => basculer(c)}
            >
              {on && <Check size={14} strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <label className="palette-libre" htmlFor={id}>
        <span className="palette-libre__roue" aria-hidden="true" />
        <span className="palette-libre__textes">
          <strong>Autre couleur</strong>
          <span>Ouvrir la grande palette et choisir la teinte exacte</span>
        </span>
        <input ref={palette} id={id} type="color" defaultValue="#0d1b3d" aria-label="Choisir une autre couleur dans la palette" />
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

function Champ({ spec, valeur, onChange, categorie }) {
  const id = `spec-${spec.cle}`;
  if (estCouleurs(spec)) {
    return <Couleurs id={id} valeur={valeur} onChange={onChange} enNoms={spec.type !== 'couleurs'} />;
  }
  switch (spec.type) {
    case 'variantes':
    case 'liste':
      return <Valeurs id={id} spec={spec} categorie={categorie} valeurs={enTableau(valeur)} onChange={onChange} />;
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
 * Valeurs d'une option : les propositions (celles de l'admin, ou les tailles
 * de vêtements) à cocher, et un champ pour taper les siennes. Une valeur
 * choisie se retire d'un clic.
 */
function Valeurs({ id, spec, valeurs, onChange, categorie }) {
  const [saisie, setSaisie] = useState('');
  const options = optionsProposees(spec, categorie);
  const coche = (o) => valeurs.some((v) => v.toLowerCase() === o.toLowerCase());
  const tapees = valeurs.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));
  // Les tailles proposées par défaut n'enferment pas : on peut toujours
  // taper la sienne. Seules les options posées par l'admin sans « libre »
  // sont une liste fermée.
  const peutTaper = spec.libre || !spec.options?.length;
  const emettre = (liste) => onChange(dansLOrdre(liste, options));

  const basculer = (o) => emettre(coche(o)
    ? valeurs.filter((v) => v.toLowerCase() !== o.toLowerCase())
    : [...valeurs, o]);

  const ajouter = () => {
    // « S, M, L » tapé d'un coup donne trois valeurs ; « 1,5 L » en reste une.
    const nouvelles = saisie.split(/,(?!\d)/).map((x) => x.trim()).filter(Boolean)
      .filter((x) => !coche(x));
    if (nouvelles.length) emettre([...valeurs, ...nouvelles]);
    setSaisie('');
  };

  const exemple = options.length && spec.cle === 'tailles'
    ? 'Autre taille (ex. 46, Taille unique) puis Entrée'
    : (spec.aide || 'Tapez une valeur puis Entrée');

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
            placeholder={exemple}
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
