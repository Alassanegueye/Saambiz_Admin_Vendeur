import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { ROUTES } from '../../constants/routes';
import useLoginForm from '../../hooks/useLoginForm';
import { Link } from 'react-router-dom';
import PanneauMarque from '../../components/auth/PanneauMarque';

// Retour vers le site public, réglable pour les environnements de recette.
const SITE_VITRINE = import.meta.env.VITE_SITE_URL || 'https://saambiz.com';

export default function VendeurLoginPage() {
  const navigate = useNavigate();
  const [voirMdp, setVoirMdp] = useState(false);

  const { email, setEmail, password, setPassword, loading, frozen, countdown, handleSubmit } =
    useLoginForm((utilisateur) => {
      if (utilisateur.role !== 'Vendeur') {
        return "Ce compte n'est pas un compte vendeur.";
      }
      toast.success('Bienvenue sur votre espace vendeur !');
      navigate(ROUTES.DASHBOARD, { replace: true });
    });

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
        <PanneauMarque />

        {/* ── Panneau de droite ── */}
        <main className="cnx-droite">
          <a href={SITE_VITRINE} className="cnx-retour">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Retour au site
          </a>

          <div className="cnx-carte">
            <h2 className="cnx-carte-titre">Espace vendeur</h2>
            <p className="cnx-carte-sous">Les mêmes identifiants que dans l'application SaamBiz</p>

            {frozen && (
              <div className="login-freeze-banner">
                Trop de tentatives — réessayez dans <strong>{countdown}s</strong>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="cnx-champ">
                <label className="cnx-label" htmlFor="email">Email ou téléphone</label>
                <div className="cnx-saisie">
                  <span className="cnx-saisie-icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    placeholder="votre@email.com ou 77 123 45 67"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
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
                <a href="#oubli" className="cnx-oubli" onClick={motDePasseOublie}>
                  Mot de passe oublié ?
                </a>
              </div>

              <button className="cnx-bouton" type="submit" disabled={loading || frozen}>
                {loading && <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />}
                {loading ? 'Connexion…' : frozen ? `Attente ${countdown}s…` : 'Se connecter'}
              </button>
            </form>

            <div className="cnx-ou"><span>OU</span></div>

            {/* Création du compte vendeur ici même, ou dans l'application :
                le compte est le même des deux côtés. */}
            <Link to={ROUTES.INSCRIPTION} className="cnx-secondaire">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M4 9v11a1 1 0 0 0 1 1h9" />
                <line x1="18" y1="14" x2="18" y2="20" />
                <line x1="15" y1="17" x2="21" y2="17" />
              </svg>
              Pas encore de boutique ? Créez-en une
            </Link>
          </div>

        </main>
      </div>
    </>
  );
}
