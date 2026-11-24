import { useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Une étape du site, repliable.
 *
 * Fermée, elle tient sur une ligne et dit déjà où l'on en est (« 2 sections ·
 * 14 produits ») : le vendeur voit tout son site d'un coup d'œil et n'ouvre
 * que ce qu'il veut changer. Une seule étape est ouverte à la fois.
 */
export default function EtapeSite({ cle, numero, titre, resume, fait, aFaire, ouverte, onBasculer, children }) {
  const racine = useRef(null);

  // Ouverte, l'étape remonte en haut de l'écran si la fermeture de la
  // précédente l'a fait sortir du champ de vision.
  useEffect(() => {
    if (!ouverte || !racine.current) return;
    const haut = racine.current.getBoundingClientRect().top;
    if (haut < 70 || haut > window.innerHeight * 0.6) {
      racine.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [ouverte]);

  return (
    <section ref={racine} className={`etape-site${ouverte ? ' est-ouverte' : ''}${fait ? ' est-faite' : ''}`} id={`etape-${cle}`}>
      <h3 className="etape-site__titre">
        <button
          type="button"
          className="etape-site__entete"
          onClick={onBasculer}
          aria-expanded={ouverte}
          aria-controls={`etape-${cle}-contenu`}
        >
          <span className="etape-site__num" aria-hidden="true">
            {fait ? <Check size={15} strokeWidth={3} /> : numero}
          </span>
          <span className="etape-site__textes">
            <span className="etape-site__nom">{titre}</span>
            <span className="etape-site__resume">{resume}</span>
          </span>
          {aFaire && <span className="etape-site__a-faire">À faire</span>}
          <ChevronDown className="etape-site__chevron" size={18} aria-hidden="true" />
        </button>
      </h3>
      {ouverte && (
        <div className="etape-site__contenu" id={`etape-${cle}-contenu`} role="region" aria-label={titre}>
          {children}
        </div>
      )}
    </section>
  );
}
