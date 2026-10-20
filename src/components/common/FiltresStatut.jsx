import { memo } from 'react';

/**
 * Filtres en pastilles (Tous / Actifs / Suspendus…), comme sur le dashboard
 * Yobante Boutique. `options` : [{ valeur, libelle, nombre? }].
 */
const FiltresStatut = memo(function FiltresStatut({ options, valeur, onChange }) {
  return (
    <div className="filtres-statut" role="group" aria-label="Filtrer par statut">
      {options.map((o) => (
        <button
          key={o.valeur || 'tous'}
          type="button"
          className={`filtre-statut${valeur === o.valeur ? ' actif' : ''}`}
          onClick={() => onChange(o.valeur)}
          aria-pressed={valeur === o.valeur}
        >
          {o.libelle}
          {o.nombre !== undefined && <span className="filtre-statut-nombre">{o.nombre}</span>}
        </button>
      ))}
    </div>
  );
});

export default FiltresStatut;
