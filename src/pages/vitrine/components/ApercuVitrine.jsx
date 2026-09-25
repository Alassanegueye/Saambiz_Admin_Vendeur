/**
 * Aperçu miniature du site, redessiné en HTML plutôt que chargé dans une
 * iframe.
 *
 * Une iframe donnerait le vrai rendu, mais elle exige que le site soit déjà
 * publié avec les réglages en cours — donc d'enregistrer avant de voir. Ici,
 * le vendeur voit sa couleur et sa mise en page bouger pendant qu'il choisit,
 * sans un seul aller-retour réseau. Ce n'est pas le site : c'est une maquette
 * fidèle sur les deux points qu'on lui demande de trancher.
 */
export default function ApercuVitrine({ valeurs, boutique }) {
  const accent = valeurs.accent || '#0D1B3D';
  const nom = boutique?.nom || 'Ma boutique';

  return (
    <div className="apercu" style={{ '--apercu-accent': accent }} aria-hidden="true">
      <div className="apercu-cadre">
        {valeurs.annonce && <div className="apercu-annonce">{valeurs.annonce}</div>}

        <div className="apercu-entete">
          <span className="apercu-logo">{nom.charAt(0).toUpperCase()}</span>
          <span className="apercu-nom">{nom}</span>
          <span className="apercu-menu" />
        </div>

        <div className={`apercu-banniere ${valeurs.modele === 'catalogue' ? 'est-compacte' : ''}`}>
          <span className="apercu-titre">{nom}</span>
          {boutique?.slogan && <span className="apercu-slogan">{boutique.slogan}</span>}
          <span className="apercu-bouton">Voir les produits</span>
        </div>

        {valeurs.sections.categories && (
          <div className="apercu-rayons">
            <span /><span /><span />
          </div>
        )}

        {/* La disposition change avec la mise en page choisie — c'est
            exactement la différence entre les trois modèles. */}
        {valeurs.modele === 'galerie' && (
          <div className="apercu-galerie">
            <div className="apercu-vedette" />
            <div className="apercu-grille apercu-grille--2">
              <div /><div />
            </div>
          </div>
        )}

        {valeurs.modele === 'catalogue' && (
          <div className="apercu-liste">
            <div /><div /><div />
          </div>
        )}

        {valeurs.modele === 'classique' && (
          <div className="apercu-grille apercu-grille--3">
            <div /><div /><div />
          </div>
        )}

        <div className="apercu-app">
          <span className="apercu-app__picto" />
          <span>Suivez {nom} dans l'application</span>
        </div>
      </div>
    </div>
  );
}
