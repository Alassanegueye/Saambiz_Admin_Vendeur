import '../../styles/marque.css';

/**
 * Pictogramme SaamBiz dessiné en SVG, pour pouvoir l'animer.
 *
 * Les formes (traits de vitesse, sac, anse, trois barres, flèche) ont été
 * relevées sur le logo d'origine et gardent ses couleurs : au repos, le
 * dessin se confond avec le PNG, mais chaque pièce peut bouger seule.
 *
 *  - variante « couleur » : sac bleu marine, flèche blanche — sur fond clair ;
 *  - variante « clair »   : sac blanc, flèche bleu marine — sur fond sombre.
 *  - mode « entree » : l'animation se joue une fois (≈ 1,2 s) ; « rapide » :
 *    la même en ≈ 0,7 s (changement de page) ; « boucle » : en continu
 *    (attente) ; « fixe » : aucune.
 *
 * Sans `titre`, le dessin est décoratif et masqué aux lecteurs d'écran : c'est
 * le cas courant, le nom SaamBiz étant écrit juste à côté.
 */
export default function LogoAnime({ taille = 56, variante = 'couleur', mode = 'entree', titre, className = '' }) {
  const hauteur = Math.round((taille * 412) / 460);
  const accessibilite = titre ? { role: 'img', 'aria-label': titre } : { 'aria-hidden': 'true' };

  return (
    <svg
      className={`logo-anime logo-anime--${variante} logo-anime--${mode}${className ? ` ${className}` : ''}`}
      width={taille}
      height={hauteur}
      viewBox="0 0 460 412"
      focusable="false"
      {...accessibilite}
    >
      <g className="la-vitesse">
        <rect className="la-trait la-trait-1" x="46" y="216" width="81" height="18" rx="9" />
        <rect className="la-trait la-trait-2" x="2" y="259" width="125" height="18" rx="9" />
        <rect className="la-trait la-trait-3" x="51" y="300" width="76" height="18" rx="9" />
      </g>
      <g className="la-sac">
        <path className="la-anse" d="M227.5 114V90a71.5 71.5 0 0 1 143 0v24" pathLength="1" />
        <rect className="la-corps" x="141" y="107" width="317" height="303" rx="56" />
        <rect className="la-barre la-barre-1" x="196" y="314" width="47" height="63" rx="9" />
        <rect className="la-barre la-barre-2" x="269" y="281" width="50" height="96" rx="9" />
        <rect className="la-barre la-barre-3" x="348" y="241" width="49" height="136" rx="9" />
        <path className="la-fleche" d="M201 272l65-58 33 29 73-65" pathLength="1" />
        <polygon className="la-pointe" points="347,153 413,142 393,206" />
      </g>
    </svg>
  );
}
