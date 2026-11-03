import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LogoAnime from '../marque/LogoAnime';

// Durée pendant laquelle le voile reste posé : le temps que le logo se dessine
// (mode « rapide »). La page arrive dessous pendant ce temps.
const DUREE_VOILE = 640;

const mouvementReduit = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Transition entre les pages de l'espace.
 *
 * À chaque nouvelle adresse, un voile clair couvre le contenu — la barre de
 * navigation reste visible —, le logo s'y dessine avec le nom de la page
 * demandée, puis le voile se lève sur la nouvelle page, qui monte en fondu.
 * Le chargement des données se fait pendant ce temps, à l'abri du voile.
 *
 * Seul le chemin compte : un filtre (?statut=…) ou l'ouverture d'une fenêtre
 * ne rejouent rien. Mouvement réduit : ni voile, ni montée.
 *
 * @param titres { '/chemin': 'Nom de la page' } — affiché sous le logo.
 */
export default function TransitionPage({ titres = {}, children }) {
  const { pathname } = useLocation();
  const [chemin, setChemin] = useState(pathname);
  // Le voile est aussi posé à l'arrivée dans l'espace (juste après la
  // connexion) : c'est la première page que l'on voit.
  const [voile, setVoile] = useState(() => !mouvementReduit());

  // Nouvelle adresse : le voile revient (réglé pendant le rendu plutôt que
  // dans un effet, pour éviter un rendu de la page sans voile).
  if (chemin !== pathname) {
    setChemin(pathname);
    if (!mouvementReduit()) setVoile(true);
  }

  useEffect(() => {
    if (!voile) return undefined;
    const t = setTimeout(() => setVoile(false), DUREE_VOILE);
    return () => clearTimeout(t);
  }, [voile, chemin]);

  const titre = titres[chemin];

  return (
    <>
      <div className={`transition-voile${voile ? ' transition-voile--visible' : ''}`} aria-hidden="true">
        {/* La clé rejoue le dessin du logo à chaque page. */}
        <div className="transition-voile__centre" key={chemin}>
          <LogoAnime taille={84} mode="rapide" />
          {titre && <span className="transition-voile__titre">{titre}</span>}
        </div>
      </div>
      <div className="page-entree" key={chemin}>
        {children}
      </div>
    </>
  );
}
