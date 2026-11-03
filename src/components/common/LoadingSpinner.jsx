import { memo } from 'react';
import LogoAnime from '../marque/LogoAnime';

/**
 * Attente d'une page ou d'un bloc : le logo SaamBiz en boucle (les barres
 * montent, la flèche se trace). `small` garde le petit cercle, fait pour se
 * loger dans un bouton.
 */
const LoadingSpinner = memo(function LoadingSpinner({ fullPage = false, small = false }) {
  const cadre = fullPage ? 'loading-full' : 'loading-center';

  if (small) {
    return <div className={cadre}><div className="spinner spinner-sm" /></div>;
  }

  return (
    <div className={`${cadre} chargement-marque`} role="status" aria-live="polite">
      <LogoAnime taille={fullPage ? 76 : 56} mode="boucle" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
});

export default LoadingSpinner;
