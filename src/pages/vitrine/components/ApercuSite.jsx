import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Origine du site public, où vit la page d'aperçu (/apercu). */
function origineSite(url) {
  const forcee = import.meta.env.VITE_SITE_URL;
  try { return new URL(forcee || url).origin; } catch { return null; }
}

const LARGEURS = { ordinateur: 1280, telephone: 390 };

/**
 * Le vrai site, en direct, à côté des réglages.
 *
 * La page /apercu du site public est chargée dans un cadre ; on lui envoie
 * les données de la boutique (catalogue compris, même si le site n'est pas
 * encore publié) et les réglages en cours d'édition. Chaque changement se
 * voit tout de suite, sans enregistrer.
 */
export default function ApercuSite({ url, donnees, brouillon, cible }) {
  const cadre = useRef(null);
  const boite = useRef(null);
  const [pret, setPret] = useState(false);
  const [ecran, setEcran] = useState('ordinateur');
  const [taille, setTaille] = useState({ l: 0, h: 0 });
  const origine = origineSite(url);

  // La page d'aperçu prévient quand elle est prête à recevoir.
  useEffect(() => {
    const ecouter = (e) => {
      if (e.source === cadre.current?.contentWindow && e.origin === origine && e.data?.type === 'saambiz-apercu-pret') {
        setPret(true);
      }
    };
    window.addEventListener('message', ecouter);
    return () => window.removeEventListener('message', ecouter);
  }, [origine]);

  useEffect(() => {
    if (!pret || !donnees || !origine) return;
    cadre.current?.contentWindow?.postMessage({ type: 'saambiz-apercu', donnees, brouillon }, origine);
  }, [pret, donnees, brouillon, origine]);

  // L'aperçu descend jusqu'à la partie du site que le vendeur est en train de régler.
  useEffect(() => {
    if (!pret || !donnees || !origine || !cible) return;
    cadre.current?.contentWindow?.postMessage({ type: 'saambiz-apercu-cible', cible }, origine);
  }, [pret, donnees, cible, origine]);

  // Le site est dessiné à sa vraie largeur, puis réduit pour tenir dans la colonne.
  useLayoutEffect(() => {
    const el = boite.current;
    if (!el) return undefined;
    const mesurer = () => setTaille({ l: el.clientWidth, h: el.clientHeight });
    mesurer();
    const obs = new ResizeObserver(mesurer);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const largeur = LARGEURS[ecran];
  const echelle = taille.l ? Math.min(1, taille.l / largeur) : 1;

  if (!origine) return null;

  return (
    <div className="apercu-site">
      <div className="apercu-site__barre">
        <span className="apercu-site__titre">Aperçu en direct</span>
        <div className="apercu-site__ecrans" role="group" aria-label="Taille de l'aperçu">
          {[['ordinateur', 'Ordinateur'], ['telephone', 'Téléphone']].map(([cle, nom]) => (
            <button key={cle} type="button" className={ecran === cle ? 'est-actif' : ''}
              onClick={() => setEcran(cle)} aria-pressed={ecran === cle}>{nom}</button>
          ))}
        </div>
      </div>
      <div className={`apercu-site__boite apercu-site__boite--${ecran}`} ref={boite}>
        <iframe
          ref={cadre}
          title="Aperçu de votre site"
          src={`${origine}/apercu`}
          style={{
            width: largeur,
            height: taille.h ? taille.h / echelle : 800,
            transform: `scale(${echelle})`,
          }}
        />
        {(!pret || !donnees) && <div className="apercu-site__attente">Chargement de l'aperçu…</div>}
      </div>
    </div>
  );
}
