import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { ROUTES } from '../../constants/routes';
import useLoginForm from '../../hooks/useLoginForm';
import PICTO from '../../assets/images/picto-saambiz.png';

// Retour vers le site public, réglable pour les environnements de recette.
const SITE_VITRINE = import.meta.env.VITE_SITE_URL || 'https://saambiz.sn';

// Adresse mémorisée par « Se souvenir de moi » : uniquement l'email, jamais
// le mot de passe.
const CLE_EMAIL = 'saambiz_email_vendeur';

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

export default function VendeurLoginPage() {
  const navigate = useNavigate();
  const [voirMdp, setVoirMdp] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(true);

  const { email, setEmail, password, setPassword, loading, frozen, countdown, handleSubmit } =
    useLoginForm((utilisateur) => {
      if (utilisateur.role !== 'Vendeur') {
        return "Ce compte n'est pas un compte vendeur.";
      }
      // Seule l'adresse est retenue, et seulement si on l'a demandé.
      try {
        if (seSouvenir) localStorage.setItem(CLE_EMAIL, utilisateur.email || '');
        else localStorage.removeItem(CLE_EMAIL);
      } catch { /* stockage indisponible : sans conséquence */ }

      toast.success('Bienvenue sur votre espace vendeur !');
      navigate(ROUTES.DASHBOARD, { replace: true });
    });

  // Pré-remplissage à l'ouverture si l'adresse a été mémorisée.
  useEffect(() => {
    try {
      const memorise = localStorage.getItem(CLE_EMAIL);
      if (memorise) setEmail(memorise);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const motDePasseOublie = (e) => {
    e.preventDefault();
    // La réinitialisation passe par un code envoyé par email, et ce parcours
    // n'existe aujourd'hui que dans l'application mobile. Mieux vaut le dire
    // que d'ouvrir un formulaire qui ne mènerait nulle part.
    toast.info(
      "La réinitialisation se fait depuis l'application SaamBiz, "
      + "rubrique « Mot de passe oublié » de l'écran de connexion.",
      { autoClose: 7000 }
    );
  };

  return (
    <>
      <Helmet><title>Connexion vendeur — SaamBiz</title></Helmet>

      <div className="cnx">
        {/* ── Panneau de gauche ── */}
        <aside className="cnx-panneau">
          <div className="cnx-decor" aria-hidden="true">
            <span className="cnx-cercle c1" />
            <span className="cnx-cercle c2" />
            <span className="cnx-cercle c3" />
            <span className="cnx-halo" />
          </div>

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

        {/* ── Panneau de droite ── */}
        <main className="cnx-droite">
          <div className="cnx-carte">
            <span className="cnx-carte-icone" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" stroke="currentColor" />
                <path d="M9 21v-6h6v6" stroke="currentColor" />
                <path d="M3 9l1.5-5h15L21 9" stroke="var(--color-accent)" />
                <path d="M8 4v5M12 4v5M16 4v5" stroke="var(--color-accent)" strokeWidth="1.5" />
              </svg>
            </span>

            <h2 className="cnx-carte-titre">Espace vendeur</h2>
            <p className="cnx-carte-sous">Connectez-vous avec le compte de votre boutique</p>

            {frozen && (
              <div className="login-freeze-banner">
                Trop de tentatives — réessayez dans <strong>{countdown}s</strong>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="cnx-champ">
                <label className="cnx-label" htmlFor="email">Email</label>
                <div className="cnx-saisie">
                  <span className="cnx-saisie-icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={frozen}
                  />
                </div>
              </div>

              <div className="cnx-champ">
                <label className="cnx-label" htmlFor="password">Mot de passe</label>
                <div className="cnx-saisie">
                  <span className="cnx-saisie-icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={voirMdp ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={frozen}
                  />
                  <button
                    type="button"
                    className="cnx-oeil"
                    onClick={() => setVoirMdp((v) => !v)}
                    aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      {voirMdp && <line x1="3" y1="21" x2="21" y2="3" />}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="cnx-ligne">
                <label className="cnx-souvenir">
                  <input
                    type="checkbox"
                    checked={seSouvenir}
                    onChange={(e) => setSeSouvenir(e.target.checked)}
                  />
                  <span className="cnx-case" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Se souvenir de moi
                </label>
                <a href="#oubli" className="cnx-oubli" onClick={motDePasseOublie}>
                  Mot de passe oublié ?
                </a>
              </div>

              <button className="cnx-bouton" type="submit" disabled={loading || frozen}>
                <span className="cnx-bouton-fleche" aria-hidden="true">
                  {loading ? (
                    <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </span>
                {loading ? 'Connexion…' : frozen ? `Attente ${countdown}s…` : 'Se connecter'}
              </button>
            </form>

            <div className="cnx-ou"><span>OU</span></div>

            {/* La création de boutique se fait dans l'application mobile :
                on renvoie vers le téléchargement, pas vers un formulaire. */}
            <a href={`${SITE_VITRINE}#download`} className="cnx-secondaire">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M4 9v11a1 1 0 0 0 1 1h9" />
                <line x1="18" y1="14" x2="18" y2="20" />
                <line x1="15" y1="17" x2="21" y2="17" />
              </svg>
              Pas encore de boutique ? Créez-en une
            </a>
          </div>

          <a href={SITE_VITRINE} className="cnx-retour">← Retour sur saambiz.sn</a>

          <p className="cnx-securite">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Sécurisé et fiable. Vos données sont protégées.
          </p>
        </main>
      </div>
    </>
  );
}
