import { memo } from 'react';

/**
 * Petites barres sans axe ni libellé, pour lire une tendance d'un coup d'œil
 * (bandeau d'accueil). Elles montent l'une après l'autre à l'affichage, comme
 * celles du logo ; la dernière — la période en cours — est pleine.
 *
 * @param valeurs  nombres, du plus ancien au plus récent
 * @param libelle  description lue par les lecteurs d'écran
 */
const MiniBarres = memo(function MiniBarres({ valeurs = [], libelle }) {
  if (valeurs.length === 0) return null;
  const max = Math.max(...valeurs, 1);

  return (
    <div className="mini-barres" role="img" aria-label={libelle}>
      {valeurs.map((v, i) => (
        <span
          key={i}
          className={`mini-barres__barre${i === valeurs.length - 1 ? ' mini-barres__barre--recent' : ''}`}
          style={{ height: `${Math.max((v / max) * 100, 6)}%`, '--i': i }}
        />
      ))}
    </div>
  );
});

export default MiniBarres;
