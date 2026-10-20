import PICTO from '../../assets/images/picto-saambiz.png';

// Panneau bleu marine de gauche, commun à la connexion et à l'inscription.
const ATOUTS = [
  {
    titre: 'Gérez vos produits et stocks',
    texte: 'Ajoutez, modifiez et suivez vos articles facilement.',
    icone: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
  },
  {
    titre: 'Suivez vos commandes',
    texte: 'Consultez et gérez toutes vos commandes en temps réel.',
    icone: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
  },
  {
    titre: 'Notifications et promotions',
    texte: 'Informez vos clients et boostez vos ventes.',
    icone: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  },
  {
    titre: 'Statistiques avancées',
    texte: 'Analysez vos performances et développez votre activité.',
    icone: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  },
];

export default function PanneauMarque() {
  return (
    <aside className="cnx-panneau">
      <div className="cnx-panneau-contenu">
        <div className="cnx-marque">
          <div className="cnx-marque-ligne">
            <span className="cnx-picto"><img src={PICTO} alt="" /></span>
            <span className="cnx-mot">Saam<span>Biz</span></span>
          </div>
          <p className="cnx-signature">Gérez. Vendez. Développez.</p>
        </div>

        <h1 className="cnx-titre">
          Tout votre commerce,<br />
          depuis <em>un seul espace.</em>
        </h1>
        <p className="cnx-chapo">
          Pilotez votre boutique comme un pro : produits, commandes,
          livraisons, promotions et bien plus encore.
        </p>

        <ul className="cnx-atouts">
          {ATOUTS.map((a) => (
            <li key={a.titre} className="cnx-atout">
              <span className="cnx-atout-icone" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {a.icone}
                </svg>
              </span>
              <span className="cnx-atout-texte">
                <strong>{a.titre}</strong>
                <small>{a.texte}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
