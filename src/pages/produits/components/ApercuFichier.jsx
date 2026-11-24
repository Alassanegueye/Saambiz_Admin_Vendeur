import { useEffect, useState } from 'react';

/**
 * Aperçu d'une photo choisie sur l'appareil, avant tout envoi.
 *
 * L'adresse locale (blob:) est créée et libérée dans le même effet : créée
 * au rendu et libérée par l'effet, elle disparaissait au double montage du
 * mode strict, et l'aperçu restait vide. Elle est libérée dès que la photo
 * change ou quitte l'écran.
 */
export default function ApercuFichier({ fichier, alt = '', grand = false }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!fichier) { setUrl(null); return undefined; }
    const adresse = URL.createObjectURL(fichier);
    setUrl(adresse);
    return () => URL.revokeObjectURL(adresse);
  }, [fichier]);
  if (!url) return <span className={grand ? 'photo-principale__image' : 'photos-ajoutees__image'} aria-hidden="true" />;
  return <img className={grand ? 'photo-principale__image' : 'photos-ajoutees__image'} src={url} alt={alt} />;
}
